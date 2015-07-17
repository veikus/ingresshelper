(function() {

    check();

    chrome.runtime.sendMessage({ action: 'getExtScripts' }, function(val) {
        val.forEach(loadExternal);
    });

    function check() {
        var elem = document.querySelector('#innerstatus .map .help');

        if (elem && elem.innerHTML === 'done') {
            sendCompleteMessage();
        } else {
            setTimeout(check, 100);
        }
    }

    function sendCompleteMessage() {
        chrome.runtime.sendMessage({ action: 'complete' });
    }

    function loadExternal(url) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.src = url;
        document.getElementsByTagName('head')[0].appendChild(s);
    }
}());