var intervalId;
var secs = 0;

function stop() {
    var elem = document.getElementById('btn');
    elem.onclick = start;
    elem.innerHTML = 'Start';
    secs = 0;

    clearInterval(intervalId);
}

function start() {
    var elem = document.getElementById('btn');
    elem.onclick = stop;
    elem.innerHTML = 'Stop';

    function updater() {
        secs += 1;
        hours = Math.floor(secs / 3600);
        minutes = Math.floor((secs%3600) / 60);
        s = Math.floor(secs % 60);

        document.getElementById('stopwatch').innerHTML = Math.floor(hours/10) + (hours % 10) + "h " + Math.floor(minutes / 10) + (minutes % 10) + "m " + Math.floor(s/10) + (s % 10) + "s";
    }
    
    intervalId = setInterval(updater, 1000);
}