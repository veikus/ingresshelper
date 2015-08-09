/**
 * THIS FILE HAS BEEN MODIFIED by ingress helper team!
 *
 * @file Ingress-ICE, the main script
 * @author Nikitakun (https://github.com/nibogd)
 * @version 2.3.0
 * @license MIT
 * @see {@link https://github.com/nibogd/ingress-ice|GitHub }
 * @see {@link https://ingress.divshot.io/|Website }
 */

"use strict";

/**
 * Parse the config. Command-line parameters or from a file - if using a start script.
 * if the first argument is a string, use old config format
 * if the first argument is config version, use that version of config
 */
var l, p, width, height, iitc, page, loginTimeout, activeTask, taskTimeout, isLoadedTimeout;

l = 'google_login';
p = 'google_pass';
width = 1280;
height = 1024;
iitc = true;
loginTimeout = 10 * 1000;

page = require('webpage').create();

/** @function setVieportSize */
page.viewportSize = {
    width: width,
    height: height
};

//page.onResourceRequested = function(requestData, networkRequest) {
//    console.log('\n\nRequest (#' + requestData.id + '): ' + JSON.stringify(requestData));
//};

startNextTask();

// Functions
function get(url, cb) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url, false );

    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            cb(xmlHttp.responseText, xmlHttp.status);
        }
    };

    xmlHttp.send(null);
}

function startNextTask() {
    clearTimeout(taskTimeout);
    clearTimeout(isLoadedTimeout);

    get('http://localhost:9999/get-task', onResp);

    function onResp(resp, status) {
        console.log('xxx >', status);

        if (status !== 200) {
            setTimeout(startNextTask, 10 * 1000);
            return;
        }

        console.log('xxx', resp);

        activeTask = JSON.parse(resp);
        //taskTimeout = setTimeout(completeTask, activeTask.timeout);

        createScreenshot({
            url: activeTask.url
        });
    }
}

function completeTask() {
    clearTimeout(taskTimeout);
    clearTimeout(isLoadedTimeout);

    setTimeout(function() {
        page.render(activeTask.fileName);

        get('http://localhost:9999/complete-task', function() {
            startNextTask();
        });
    }, 5000);
}

function failTask() {
    startNextTask();
}


/**
 * console.log() wrapper
 * @param {String} str - what to announce
 */
function announce(str) {
    console.log(new Date().toString() + ': ' + str);
}

/**
 * Log in to google. Doesn't use post, because URI may change.
 * @param l - google login
 * @param p - google password
 */
function login(l, p) {
    page.evaluate(function (l) {
        document.getElementById('Email').value = l;
    }, l);

    page.evaluate(function () {
        document.querySelector("#next").click();
    });

    window.setTimeout(function () {
        page.evaluate(function (p) {
            document.getElementById('Passwd').value = p;
        }, p);

        page.evaluate(function () {
            document.querySelector("#next").click();
        });

        page.evaluate(function () {
            document.getElementById('gaia_loginform').submit();
        });
    }, loginTimeout);
}

/**
 * Check if logged in successfully, quit if failed, accept appEngine request if needed and prompt for two step code if needed.
 */
function checkLogin() {
    if (page.url.substring(0, 40) === 'https://accounts.google.com/ServiceLogin') {
        announce('login failed: wrong email and/or password');
        return false;
    }

    if (page.url.substring(0, 40) === 'https://accounts.google.com/SecondFactor') {
        announce('Please turn off two-step verification');
        return false;
    }

    return true;
}

function isLogged() {
    return page.evaluate(function() {
        var elem = document.querySelector('h2');

        return !elem || elem.innerHTML !== 'Welcome to Ingress.'
    });
}

/**
 * Inserts IITC
 * @param {boolean} iitc
 * @author akileos (https://github.com/akileos)
 * @author Nikitakun
 */
function injectITTC() {
    page.includeJs('http://localhost:9999/iitc/total-conversion-build.user.js');
}

function injectCSS() {
    page.evaluate(function() {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'http://localhost:9999/client/hide_all.css';
        document.head.insertBefore(link, document.head.lastChild);
    });
}

function isLoaded() {
    var done;

    done = page.evaluate(function () {
        var elemIITC = document.querySelector('#innerstatus .map .help'),
            elemIntel = document.getElementById('loading_msg');

        return (elemIITC && elemIITC.innerHTML === 'done') ||
            (elemIntel && elemIntel.style.display === 'none')
    });

    if (done) {
        injectCSS();
        completeTask();
    } else {
        isLoadedTimeout = setTimeout(isLoaded, 500);
    }
}

function createScreenshot(params) {
    var url = params.url;

    page.open(url, function (status) {
        var link;

        if (status !== 'success') {
            announce('Can`t open page. Network problem');
            failTask();
            return;
        }

        if (!isLogged(page)) {
            announce('Not logged in. Trying to login');

            link = page.evaluate(function () {
                return document.getElementsByTagName('a')[0].href;
            });

            page.open(link, function () {
                if (status !== 'success') {
                    announce('Can`t login. Network problem');
                    failTask();
                    return;
                }

                login(l, p);

                setTimeout(function() {
                    if (checkLogin()) {
                        announce('Login successful');
                        createScreenshot(params, callback);
                    } else {
                        announce('Login error');
                        failTask();
                    }
                }, loginTimeout);
            });

            return;
        }

        if (iitc) {
            injectITTC();
        }

        // Wait for data load
        isLoaded();
    });
}