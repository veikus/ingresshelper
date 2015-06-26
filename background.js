(function() {
    var apiUrl = 'https://api.telegram.org/bot86795070:AAEoVLcNunu5b4E_zddIuCQHKtePDQFJewA',
        updateId = localStorage.getItem('offset') || 0;

    function getRequest(url, callback) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            var result;

            if (xmlhttp.readyState !== 4) {
                return;
            }

            if (xmlhttp.status == 200) {
                try {
                    result = JSON.parse(xmlhttp.responseText);
                    callback(result);
                } catch (e) {
                    console.error('JSON parse error: ' + e);

                    setTimeout(function() {
                        getRequest(url, callback);
                    }, 1000);
                }
            } else {
                console.error('GET Request incorrect status: ' + xmlhttp.status + ' ' + xmlhttp.statusText);
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
            if (data.ok) {
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
        if (task.message.location) {
            sendResponse(task, 'Please wait 30 seconds');
            makeIntelScreenshot(task);
        } else {
            sendResponse(task, 'Location required');
        }
    }

    /**
     * Send specified text for selected task
     * @param task
     * @param text
     */
    function sendResponse(task, text) {
        var url = apiUrl + '/sendMessage?chat_id='+task.message.chat.id+'&text=' + text;

        getRequest(url, function(data) {
            console.log(data);
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
            url = apiUrl + '/bot86795070:AAEoVLcNunu5b4E_zddIuCQHKtePDQFJewA/sendPhoto';

        formData.append('chat_id', task.message.chat.id);
        formData.append('photo', dataURItoBlob(img), 'screen.jpg');

        xhr.open('POST', url, true);
        xhr.send(formData);
    }

    /**
     * Makes screenshot and sends result
     * @param task
     */
    function makeIntelScreenshot(task) {
        var latitude = task.message.location.latitude,
            longitude = task.message.location.longitude;

        chrome.tabs.create({ url: 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=16' }, function(tab) {
            setTimeout(function() {
                chrome.tabs.captureVisibleTab(tab.windowId, function(img) {
                    sendPhoto(task, img);
                    chrome.tabs.remove(tab.id);
                });
            }, 20000);
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

    getUpdates();
}());