var hierarchyData;

async function wrapper() {
    const resp = await fetch('/get-categories', { method : 'POST' });
    hierarchyData = await resp.json();
    console.log(hierarchyData);

    main();
}

document.addEventListener("DOMContentLoaded", wrapper());

function main() {
    for (const [id, data] of Object.entries(hierarchyData)) {
        let li = document.createElement('li');
        li.id = id;
        li.innerHTML = data.name;

        if (!data.parent) {
            li.innerHTML = '<strong>' + li.innerHTML + '</strong>'
            document.getElementById('category-list').appendChild(li);
        }
        
        if (data.parent) {
            if (!data.is_watch) {
                li.innerHTML = '<strong>' + li.innerHTML + '</strong>';
            }

            else {
                li.innerHTML += ': ' + format(data.total_time);
            }

            document.getElementById(data.parent + '-children').appendChild(li);
        }

        if (!data.is_watch) {
            let ul = document.createElement('ul');
            ul.id = id + '-children';
            li.appendChild(ul);
        }
    }
}

function format(timeInSecs) {
    let hours = Math.floor(timeInSecs / 3600);
    let minutes = Math.floor((timeInSecs % 3600) / 60);
    let seconds = timeInSecs % 60;

    let string = "";
    if (hours !== 0) {
        string += hours + 'h ';
    }

    if (hours !== 0 || minutes !== 0) {
        string += Math.floor(minutes / 10) + '' + (minutes % 10) + 'm ';
    }

    string += Math.floor(seconds / 10) + '' + (seconds % 10) + 's';

    return string;
}