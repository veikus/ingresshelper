(function() {

    check();

    function check() {
        var elem = document.querySelector('#innerstatus .map .help');

        if (elem && elem.innerHTML === 'done') {
            sendCompleteMessage();
        } else {
            setTimeout(check, 100);
        }
    }

    function sendCompleteMessage() {
        chrome.runtime.sendMessage({ complete: true });
    }
}());