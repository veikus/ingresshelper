(function() {
    var updateId = localStorage.getItem('offset');

    function getRequest(url, callback) {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var result = JSON.parse(xmlhttp.responseText);
                callback(result);
            }
        };

        xmlhttp.open('GET', url, true);
        xmlhttp.send();
    }

    function getUpdates() {
        var url = 'https://api.telegram.org/bot86795070:AAEoVLcNunu5b4E_zddIuCQHKtePDQFJewA/getUpdates?timeout=7';

        if (updateId) {
            url += '&offset='+updateId;
            localStorage.setItem('offset', updateId)
        }

        getRequest(url, function(data) {
            if (data.ok) {
                data.result.forEach(function(task) {
                    updateId = task.update_id + 1;

                    if (task.message.location) {
                        sendResponse(task, 'Please wait 30 seconds');
                        openTab(task);
                    } else {
                        sendResponse(task, 'Location required');
                    }
                });
            }

            getUpdates();
        })
    }

    function sendResponse(task, text) {
        var url = 'https://api.telegram.org/bot86795070:AAEoVLcNunu5b4E_zddIuCQHKtePDQFJewA/sendMessage?chat_id='+task.message.chat.id+'&text=' + text;

        getRequest(url, function(data) {
            console.log(data);
        });
    }

    function sendResult(task, img) {
        var xhr = new XMLHttpRequest(),
            formData = new FormData(),
            url = 'https://api.telegram.org/bot86795070:AAEoVLcNunu5b4E_zddIuCQHKtePDQFJewA/sendPhoto';

        formData.append('chat_id', task.message.chat.id);
        formData.append('photo', dataURItoBlob(img), 'screen.jpg');

        xhr.open('POST', url, true);
        xhr.send(formData);
    }

    function openTab(task) {
        var latitude = task.message.location.latitude,
            longitude = task.message.location.longitude;

        chrome.tabs.create({ url: 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=16' }, function(tab) {
            setTimeout(function() {
                chrome.tabs.captureVisibleTab(tab.windowId, function(screenshotUrl) {
                    sendResult(task, screenshotUrl);
                    chrome.tabs.remove(tab.id);
                });
            }, 20000);
        });
    }

    // convert base64 to raw binary data held in a string
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