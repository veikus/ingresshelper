(function() {
    var token = 'YOUR_TOKEN_HERE', // Token received from BotFather
        apiUrl = 'https://api.telegram.org/bot'+token,
        updateId = localStorage.getItem('offset') || 0,
        inProgress = false,
        taskManager = new TaskManager(),
	    helpResponse = [
            'Send your location to the bot, then select portal level to zoom (L4 recommended). Lower level = closer zoom. Happy Ingressing!',
            'Authors: @veikus and @fivepointseven',
            'Source code: http://github.com/veikus/ingresshelper'
        ],
	    // Custom keyboard markup:
	    levelMarkup = {
            keyboard: [
                [
                    'L1',
                    'L2',
                    'L3',
                    'L4'
                ],
                [
                    'L5',
                    'L6',
                    'L7',
                    'L8'
                ],
                [
                    'Unclaimed portals'
                ]
            ],
            one_time_keyboard: true
	};

    getUpdates();


    function getRequest(url, callback) {
        var xmlhttp = new XMLHttpRequest();

        if (typeof callback !== 'function') {
            callback = undefined;
        }

        xmlhttp.onreadystatechange = function() {
            var result = null;

            if (xmlhttp.readyState !== 4) {
                return;
            }

            if (xmlhttp.status == 200) {
                try {
                    result = JSON.parse(xmlhttp.responseText);
                } catch (e) {
                    console.error('JSON parse error: ' + e);
                }
            } else {
                console.error('GET Request incorrect status: ' + xmlhttp.status + ' ' + xmlhttp.statusText);
            }

            if (callback) {
                callback(result);
            }
        };

        xmlhttp.open('GET', url, true);
        xmlhttp.send();
    }

    /**
     * Receive new messages and process them
     */
    function getUpdates() {
        var url = apiUrl + '/getUpdates?timeout=7';

        if (updateId) {
            url += '&offset='+updateId;
        }

        getRequest(url, function(data) {
            if (data && data.ok) {
                data.result.forEach(function(task) {
                    updateId = task.update_id + 1;
                    localStorage.setItem('offset', updateId);
                    processTask(task);
                });
            }

            getUpdates();
        })
    }

    /**
     * Process single message
     * @param task
     */
    function processTask(task) {
        var z, i;

        sendStat(task);

        if (task.message.location) {
            // Ask for zoom and cache location request
            sendResponse(task, 'Select zoom level', levelMarkup);
            taskManager.addTask(task);
        } else {
            switch (task.message.text) {
                case '/start':
                case '/help':
                    for  (i = 0; i < helpResponse.length; ++i) {
                        (function(i) { // TODO: find another way to send multiline messages
                            setTimeout(function() {
                                sendResponse(task, helpResponse[i]);
                            }, i * 500);
                        }(i));
                    }
                    break;

                case 'Unclaimed portals':
                    z = 17;
                    break;

                case 'L1':
                    z = 15;
                    break;

                case 'L2':
                    z = 13;
                    break;

                case 'L3':
                    z = 12;
                    break;

                case 'L4':
                    z = 11;
                    break;

                case 'L5':
                    z = 9;
                    break;

                case 'L6':
                    z = 8;
                    break;

                case 'L7':
                    z = 6;
                    break;

                case 'L8':
                    z = 3;
                    break;

                default:
                    sendResponse(task, 'Incorrect command.');
            }

            if (z) {
                if (taskManager.setZoom(task, z)) {
                    sendResponse(task, 'Task created. Please wait ' + taskManager.calculateEstimateTime());

                    if (!inProgress) {
                        makeIntelScreenshot();
                    }
                } else {
                    sendResponse(task, 'Please send location first.');
                }
            }

        }
    }

    /**
     * Send specified text for selected task
     * @param task
     * @param text
     * @param markup
     */
    function sendResponse(task, text, markup) {
        if (!markup) {
            markup = { hide_keyboard: true };
        }

        markup = JSON.stringify(markup);

        var url = apiUrl + '/sendMessage?chat_id='+task.message.chat.id+'&text='+text+'&disable_web_page_preview=true&reply_markup='+markup;

        getRequest(url);
    }

    /**
     * Send photo for selected task
     * @param task
     * @param img
     */
    function sendPhoto(task, img) {
        var xhr = new XMLHttpRequest(),
            formData = new FormData(),
            url = apiUrl + '/sendPhoto';

        formData.append('chat_id', task.message.chat.id);
        formData.append('photo', dataURItoBlob(img), 'screen.jpg');

        xhr.open('POST', url, true);
        xhr.send(formData);
    }

    /**
     * Makes screenshot and sends result
     */
    function makeIntelScreenshot() { // todo rename method
	    var latitude, longitude, timeout,
            task = taskManager.getTask();

        if (!task) {
            return;
        }

        inProgress = true;
        latitude = task.message.location.latitude;
        longitude = task.message.location.longitude;

	    // Set higher timeout for L7+ portals
	    if (task.zoom <= 7) {
		    timeout = 50000;
	    } else {
            timeout = 30000;
        }

        chrome.tabs.create({ url: 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=' + task.zoom }, function(tab) {
            setTimeout(function() {
                inProgress = false;

                chrome.tabs.captureVisibleTab(tab.windowId, function(img) {
                    sendPhoto(task, img);
                    chrome.tabs.remove(tab.id);

                    // getNextTask
                    makeIntelScreenshot();
                });
            }, timeout);
        });
    }

    /**
     * Send raw data to db
     * @param task
     */
    function sendStat(task) {
        var xhr = new XMLHttpRequest(),
            formData = new FormData(),
            url = 'https://lab.veikus.com/ingress_map/stat.php';

        formData.append('raw', JSON.stringify(task));

        xhr.open('POST', url, true);
        xhr.send(formData);
    }

    /**
     * Convert base64 to raw binary data held in a string
     */
    function dataURItoBlob(dataURI) {
        var mimeString, ab, ia, i,
            byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        ab = new ArrayBuffer(byteString.length);
        ia = new Uint8Array(ab);
        for (i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], {type: mimeString});
    }


    /**
     * Screenshot task manager
     * @constructor
     */
    function TaskManager() {
        var incompleteQueue = {},
            queue = [],
            activeTask = null;

        /**
         * Creates task
         * @param task {object} Telegram object from getUpdates
         */
        this.addTask = function(task) {
            var from = task.message.from.id;

            task.from = from;
            incompleteQueue[from] = task;
        };

        /**
         * Set zoom level for users incomplete task
         * @param task {object} Telegram object from getUpdates
         * @param zoom {number} Zoom level
         * @returns {boolean} Is task found and updated
         */
        this.setZoom = function(task, zoom) {
            var from = task.message.from.id;

            if (!incompleteQueue[from]) {
                return false;
            }

            incompleteQueue[from].zoom = zoom;
            queue.push(incompleteQueue[from]);
            delete incompleteQueue[from];

            return true;
        };

        /**
         * Calculates estimate time
         * @param key {number|undefined} key (or latest created will be used)
         * @returns {string}
         */
        this.calculateEstimateTime = function(key) {
            var i,
                est = 0;

            key = key ? key + 1 : queue.length;

            for (i = 0; i <= key; ++i) {
                if (queue[i]) {
                    est += queue[i].zoom <= 7 ? 50 : 30;
                }
            }

            if (est < 60) {
                return est + ' seconds';
            } else {
                return Math.ceil(est / 60) + ' minutes';
            }
        };

        /**
         * Return latest created task
         * @returns {object} Telegram object from getUpdates (with some additional properties)
         */
        this.getTask = function() {
            return queue.pop();
        }
    }

}());