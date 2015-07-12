(function() {
    var token = 'YOUR_TOKEN_HERE', // Token received from BotFather
        apiUrl = 'https://api.telegram.org/bot'+token,
        updateId = localStorage.getItem('offset') || 0,
        chatSettings = localStorage.getItem('chatSettings') || '{}',
        inProgress = false,
        taskManager = new TaskManager(),
	    helpResponse = [
            'Send your location to the bot, then select map zoom (3 - 17). Happy Ingressing!',
            'Authors: @veikus and @fivepointseven',
            'Source code: http://github.com/veikus/ingresshelper'
        ].join('\n\r'),
	    // Custom keyboard markup:
	    levelMarkup = {
            keyboard: [
                ['17 - All portals'],
                ['16', '15', '14', '13'],
                ['12', '10', '8', '6'],
                ['3 - World']
            ],
            one_time_keyboard: true
        },
        intervalTimeoutMarkup = {
            keyboard: [
                ['1 hour', '2 hours', '3 hours'],
                ['6 hours', '12 hours', '24 hours'],
                ['2 days', '3 days', '4 days'],
                ['1 week', '2 weeks', '3 weeks'],
                ['1 year']
            ],
            one_time_keyboard: true
        },
        intervalPauseMarkup = {
            keyboard: [
                ['3 minutes', '5 minutes', '10 minutes'],
                ['15 minutes', '30 minutes', '60 minutes'],
                ['2 hours', '4 hours', '6 hours'],
                ['12 hours', '24 hours']
            ],
            one_time_keyboard: true
        },
        allowedLevelOptions = [
            '17 - All portals', '17', '16', '15', '14', '13', '12', '11', '10',
            '9', '8', '7', '6', '5', '4', '3', '3 - World'
        ],
        allowedIntervalTimeouts = {
            '1 hour': 3600 * 1000,
            '2 hours': 2 * 3600 * 1000,
            '3 hours': 3 * 3600 * 1000,
            '6 hours': 6 * 3600 * 1000,
            '12 hours': 12 * 3600 * 1000,
            '24 hours': 86400 * 1000,
            '2 days': 2 * 86400 * 1000,
            '3 days': 3 * 86400 * 1000,
            '4 days': 4 * 86400 * 1000,
            '1 week': 7 * 86400 * 1000,
            '2 weeks': 14 * 86400 * 1000,
            '3 weeks': 21 * 86400 * 1000,
            '1 year': 365 * 86400 * 1000
        },
        allowedIntervalPauses = {
            '3 minutes': 3 * 60 * 1000,
            '5 minutes': 5 * 60 * 1000,
            '10 minutes': 10 * 60 * 1000,
            '15 minutes': 15 * 60 * 1000,
            '30 minutes': 30 * 60 * 1000,
            '60 minutes': 3600 * 1000,
            '2 hours': 2 * 3600 * 1000,
            '4 hours': 4 * 3600 * 1000,
            '6 hours': 6 * 3600 * 1000,
            '12 hours': 12 * 3600 * 1000,
            '24 hours': 24 * 3600 * 1000
        };

    chatSettings = JSON.parse(chatSettings);
    getUpdates();

    chrome.runtime.onMessage.addListener(function(request, sender) {
        setTimeout(makeScreenshot, 1000); // Give time for iitc modules to finish their actions
    });

    // TODO: Make single method for GET and POST requests
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

    function postRequest(url, data, callback) {
        var i,
            xmlhttp = new XMLHttpRequest(),
            formData = new FormData();

        data = data || {};

        if (typeof callback !== 'function') {
            callback = undefined;
        }

        for (i in data) {
            if (data.hasOwnProperty(i)) {
                formData.append(i, data[i]);
            }
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

        xmlhttp.open('POST', url, true);
        xmlhttp.send(formData);
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
                data.result.forEach(function(val) {
                    updateId = val.update_id + 1;
                    localStorage.setItem('offset', updateId);
                    processMessage(val.message);
                });

                getUpdates();
            } else {
                setTimeout(getUpdates, 3000);
            }
        })
    }

    /**
     * Process single message
     * @param message {object} Message from getUpdates
     */
    function processMessage(message) {
        var zoom, intervalTimeout, intervalPause,
            chatId = message.chat.id,
            isGroup = chatId < 0;

        if (message.location) {
            // Ask for zoom and cache location request
            sendResponse(chatId, 'Select zoom level', levelMarkup);

            if (taskManager.hasIncompleteInterval(chatId)) {
                taskManager.setLocation(chatId, message.location);
            } else {
                taskManager.addTask({
                    chat: message.chat,
                    location: message.location,
                    isInterval: false
                });
            }
        } else {
            switch (message.text) {
                case '/start':
                case '/help':
                    sendResponse(chatId, helpResponse);
                    break;

                case '/interval':
                    taskManager.addTask({
                        chat: message.chat,
                        isInterval: true
                    });

                    sendResponse(chatId, 'How long you need it?', intervalTimeoutMarkup);
                    break;

                case '/compression_on':
                    if (!chatSettings[chatId]) {
                        chatSettings[chatId] = {};
                    }
                    chatSettings[chatId].noCompression = false;
                    localStorage.setItem('chatSettings', JSON.stringify(chatSettings));

                    sendResponse(chatId, 'Compression enabled');
                    break;

                case '/compression_off':
                    if (!chatSettings[chatId]) {
                        chatSettings[chatId] = {};
                    }
                    chatSettings[chatId].noCompression = true;
                    localStorage.setItem('chatSettings', JSON.stringify(chatSettings));

                    sendResponse(chatId, 'Compression disabled');
                    break;

                default:
                    if (allowedIntervalTimeouts[message.text]) {
                        intervalTimeout = allowedIntervalTimeouts[message.text];
                    } else if (allowedIntervalPauses[message.text]) {
                        intervalPause = allowedIntervalPauses[message.text];
                    } else if (allowedLevelOptions.indexOf(message.text) > -1) {
                        zoom = parseInt(message.text);
                    } else if (!isGroup) {
                        sendResponse(chatId, 'Incorrect command.');
                    }
            }

            if (intervalTimeout) {
                if (taskManager.setTimeout(chatId, intervalTimeout)) {
                    sendResponse(chatId, 'How often you do need screenshots?', intervalPauseMarkup);
                } else {
                    sendResponse(chatId, 'Please enter /interval first');
                }
            }

            if (intervalPause) {
                if (taskManager.setPause(chatId, intervalPause)) {
                    sendResponse(chatId, 'Send geolocation now');
                } else {
                    sendResponse(chatId, 'Please enter /interval first');
                }
            }

            if (zoom) {
                if (taskManager.setZoom(chatId, zoom)) {
                    sendResponse(chatId, 'Task created. Please wait less than ' + taskManager.calculateEstimateTime());

                    if (!inProgress) {
                        startNextTask();
                    }
                } else {
                    sendResponse(chatId, 'Please send location first');
                }
            }

        }
    }

    /**
     * Send specified text for selected task
     * @param chatId
     * @param text
     * @param markup
     */
    function sendResponse(chatId, text, markup) {
        var url;

        if (!markup) {
            markup = { hide_keyboard: true };
        }

        markup = JSON.stringify(markup);
        url = apiUrl + '/sendMessage';

        postRequest(url, {
            chat_id: chatId,
            text: text,
            disable_web_page_preview: true,
            reply_markup: markup
        });
    }

    /**
     * Send photo for selected task
     * @param task
     * @param img
     */
    function sendPhoto(task, img) {
        var xhr = new XMLHttpRequest(),
            formData = new FormData(),
            chatId = task.chat.id,
            noCompression = chatSettings[chatId] && chatSettings[chatId].noCompression,
            url = apiUrl + (noCompression ? '/sendDocument' : '/sendPhoto');

        formData.append('chat_id', chatId);
        formData.append(noCompression ? 'document' : 'photo', dataURItoBlob(img), 'screen.png');

        xhr.open('POST', url, true);
        xhr.send(formData);
    }

    /**
     * Creates intel tab
     */
    function startNextTask() {
	    var latitude, longitude, timeout, url,
            task = taskManager.getTask();

        if (!task) {
            return;
        }

        inProgress = task;
        latitude = task.location.latitude;
        longitude = task.location.longitude;
        url = 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=' + task.zoom;

	    // Set higher timeout for L7+ portals
	    if (task.zoom <= 7) {
		    timeout = 120000;
	    } else {
            timeout = 60000;
        }

        chrome.windows.create({ url: url, type: 'popup' }, function(window) {
            task.windowId = window.id;
            task.timeout = setTimeout(makeScreenshot, timeout);
        });
    }

    /**
     * Makes screenshot and finishes task
     */
    function makeScreenshot() {
        var window,
            task = inProgress;

        // If timeout and message both triggered
        if (!task) {
            return;
        }

        inProgress = false;
        window = task.windowId;

        clearTimeout(task.timeout);

        chrome.tabs.captureVisibleTab(window, { format: 'png' }, function(img) {
            if (!img) {
                sendResponse(task.chat.id, 'I`m sorry. Looks like something comes really wrong. Please try again in few minutes');
            } else {
                sendPhoto(task, img);
            }

            chrome.windows.remove(window);
            startNextTask();
        });
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
        var intervals,
            incompleteQueue = {},
            queue = [];

        // Restore intervals
        intervals = localStorage.getItem('intervals');
        intervals = intervals ? JSON.parse(intervals) : [];

        setInterval(function() {
            var ts = new Date().getTime();

            intervals.forEach(function(task, k) {
                if (!task) {
                    return;
                }

                if (task.nextPhotoAt <= ts) {
                    queue.push(task);
                    task.nextPhotoAt = ts + task.pause;

                    if (!inProgress) {
                        startNextTask();
                    }
                }

                if (task.shutdownTime <= ts) {
                    sendResponse(task.chat.id, 'Interval finished');
                    delete(intervals[k]);
                    return;
                }
            });

            localStorage.setItem('intervals', JSON.stringify(intervals));
        }, 30000);

        /**
         * Is user already have incomplete interval task
         * @param chatId
         * @returns {boolean}
         */
        this.hasIncompleteInterval = function(chatId) {
            return incompleteQueue[chatId] && incompleteQueue[chatId].isInterval;
        };

        /**
         * Creates task
         * @param params {object}
         * @param params.chat {object} Chat details from getUpdates
         * @param params.isInterval {boolean} Is interval task
         * @param params.location {object} longitude and latitude (optional)
         */
        this.addTask = function(params) {
            var chatId = params.chat.id;

            incompleteQueue[chatId] = {
                chat: params.chat,
                isInterval: params.isInterval,
                location: params.location
            };

            return true;
        };

        /**
         *
         * @param chatId {number}
         * @param location {object} longitude and latitude
         */
        this.setLocation = function(chatId, location) {
            var task = incompleteQueue[chatId];

            if (!task) {
                return false;
            }

            task.location = location;

            return true;
        };

        /**
         * Set zoom level for users incomplete task
         * @param chatId {number} Telegram chat id
         * @param zoom {number} Zoom level
         * @returns {boolean} Is task found and updated
         */
        this.setZoom = function(chatId, zoom) {
            var task = incompleteQueue[chatId];

            if (!task) {
                return false;
            }

            task.zoom = zoom;
            queue.push(task);

            // Intervals setup
            if (task.isInterval) {
                task.shutdownTime = new Date().getTime() + task.timeout;
                task.nextPhotoAt = new Date().getTime() + task.pause;
                intervals.push(task);

                localStorage.setItem('intervals', JSON.stringify(intervals));
            }

            delete incompleteQueue[chatId];

            return true;
        };


        /**
         * Set timeout for interval
         * @param chatId {number} Telegram chat id
         * @param timeout {number} Timeout in ms
         * @returns {boolean} Is task found and updated
         */
        this.setTimeout = function(chatId, timeout) {
            var task = incompleteQueue[chatId];

            if (!task || !task.isInterval) {
                return false;
            }

            task.timeout = timeout;

            return true;
        };

        /**
         * Set pause for interval
         * @param chatId {number} Telegram chat id
         * @param pause {number} Pause in ms
         * @returns {boolean} Is task found and updated
         */
        this.setPause = function(chatId, pause) {
            var task = incompleteQueue[chatId];

            if (!task || !task.isInterval || !task.timeout) {
                return false;
            }

            task.pause = pause;

            return true;
        };

        /**
         * Calculates estimate time
         * @param key {number|undefined} key (or latest created will be used)
         * @returns {string}
         */
        this.calculateEstimateTime = function(key) {
            var i, left,
                est = 0;

            key = key ? key + 1 : queue.length;

            for (i = 0; i <= key; ++i) {
                if (queue[i]) {
                    est += queue[i].zoom <= 7 ? 120 : 60;
                }
            }

            if (est < 60) {
                return est + ' seconds';
            } else {
                left = Math.ceil(est / 60);
                return left + ' minute' + (left > 1 ? 's' : '');
            }
        };

        /**
         * Return latest created task
         * @returns {object} Telegram object from getUpdates (with some additional properties)
         */
        this.getTask = function() {
            return queue.shift();
        }
    }

}());
