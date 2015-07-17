(function() {
    var inProgress, somethingWentWrong, tasks;

    app.taskManager = {};
    app.taskManager.add = function(options) {
        tasks.push(options);
        saveTasks();

        if (!inProgress) {
            startNextTask();
        }
    };


    tasks = localStorage.getItem('task_manager__tasks');

    if (tasks) {
        tasks = JSON.parse(tasks);
    } else {
        tasks = [];
    }

    chrome.runtime.onMessage.addListener(function() {
        setTimeout(makeScreenshot, 5000); // Give time for iitc modules to finish their actions
    });

    startNextTask();


    function saveTasks() {
        var json = JSON.stringify(tasks);
        localStorage.setItem('task_manager__tasks', json);
    }

    /**
     * Creates intel tab
     */
    function startNextTask() {
        var latitude, longitude, timeout, url,
            task = tasks.shift();

        if (!task) {
            return;
        }

        inProgress = task;
        latitude = task.location.latitude;
        longitude = task.location.longitude;
        url = 'https://www.ingress.com/intel?ll=' + latitude + ',' + longitude + '&z=' + task.zoom;

        // Set higher timeout for L7+ portals
        if (task.zoom <= 7) {
            timeout = 3 * 60 * 1000;
        } else {
            timeout = 2 * 60 * 1000;
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
        saveTasks();

        chrome.tabs.captureVisibleTab(window, { format: 'png' }, function(img) {
            var compression, lang, resp;

            if (!img) {
                lang = app.settings.lang(task.chat);
                resp = somethingWentWrong[lang] || somethingWentWrong.en;
                app.telegram.sendMessage(task.chat, resp, null);
            } else {
                compression = app.settings.compression(task.chat);
                app.telegram.sendPhoto(task.chat, img, compression);
            }

            chrome.windows.remove(window);
            startNextTask();
        });
    }

    // Translations
    somethingWentWrong = {};
    somethingWentWrong.en = 'I`m sorry. Looks like something comes really wrong. Please try again in few minutes';
    somethingWentWrong.ru = 'Ой. Что-то пошло не так. Пожалуйста, попробуйте еще раз через пару минут';
}());