(function() {
	var token = 'YOUR_TOKEN_HERE'; //Token received from BotFather
    var apiUrl = 'https://api.telegram.org/bot'+token,
        updateId = localStorage.getItem('offset') || 0,
        inProgress = 0;
	var sentLocation = null;
	var z = 14;
	var timeout = 35000; //Time for intel view to load. Depends on connection speed
	var helpResponse = 'Send your location to the bot, then select portal level to zoom (L4 recommended). Lower level = closer zoom. Happy Ingressing!';
	//Custom keyboard markup:
	var levelMarkup = {
		"keyboard": [
			[
				"L1",
				"L2",
				"L3",
				"L4"
			],
			[
				"L5",
				"L6",
				"L7",
				"L8"
			],
			[
				"Unclaimed portals",
			]
		],
		"one_time_keyboard": true
	}

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
        //sendStat(task); //veikus stats
        if (task.message.location) {
            if (inProgress >= 5) {
                sendResponse(task, 'I`t too busy. Please try again in few minutes');
            } else {
	            //Ask for zoom and cache location request
                sendResponse(task, 'Select zoom level', JSON.stringify(levelMarkup));
                sentLocation = task;
            }
        } else {
	        //Help and Start commands message:
	        if(task.message.text === "/help" || task.message.text === "/start"){
		        sendResponse(task, helpResponse.toString())
	        }
	        else {
		        if(sentLocation == null) {
			        //Bad request:
			        sendResponse(task, 'Location required');
		        }
		        else {
			        //Intel screenshot request:
			        //sendResponse(task, 'Please wait ~30 seconds');
			        makeIntelScreenshot(sentLocation, task);
		        }
	        }
        }
    }

    /**
     * Send specified text for selected task
     * @param task
     * @param text
     */
    function sendResponse(task, text, markup) {
	    var ForceReply = {
		    force_reply: true
	    }
        var url = apiUrl + '/sendMessage?chat_id='+task.message.chat.id+'&text='+text+'&reply_markup='+markup;

        getRequest(url, function(data) {
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
            url = apiUrl + '/sendPhoto';

        formData.append('chat_id', task.message.chat.id);
        formData.append('photo', dataURItoBlob(img), 'screen.jpg');

        xhr.open('POST', url, true);
        xhr.send(formData);
    }

    /**
     * Makes screenshot and sends result
     * @param task
     */
    function makeIntelScreenshot(task, zoom) {
	    var latitude = task.message.location.latitude,
		    longitude = task.message.location.longitude;

	    switch (zoom.message.text) {
		    case "Unclaimed portals":
			    z = 17;
			    break;
		    case "L1":
			    z = 15;
			    break;
		    case "L2":
			    z = 13;
			    break;
		    case "L3":
			    z = 12;
			    break;
		    case "L4":
			    z = 11;
			    break;
		    case "L5":
			    z = 9;
			    break;
		    case "L6":
			    z = 8;
			    break;
		    case "L7":
			    z = 6;
			    break;
		    case "L8":
			    z = 3;
			    break;
		    default:
			    z = 14;
	    }

	    //Set higher timeout for L7+ portals
	    if(z <= 7){
		    timeout = 50000;
		    sendResponse(task, 'Please wait ~45-60 seconds');
	    }
	    
	    else{
		   sendResponse(task, 'Please wait ~30-40 seconds');
	    }
	    

	    ++inProgress;

        chrome.tabs.create({ url: 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=' + z }, function(tab) {
            sentLocation = null
            setTimeout(function() {
                chrome.tabs.captureVisibleTab(tab.windowId, function(img) {
                    sendPhoto(task, img);
                    chrome.tabs.remove(tab.id);
                    --inProgress;
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

    getUpdates();
}());