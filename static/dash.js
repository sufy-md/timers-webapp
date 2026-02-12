var hierarchyData;

async function wrapper() {
    const resp = await fetch('/get-categories', { method : 'POST' });
    hierarchyData = await resp.json();
    console.log(hierarchyData);

    main();
}

document.addEventListener("DOMContentLoaded", wrapper);

function main() {
    if (Object.keys(hierarchyData).length === 0) {
        document.body.innerHTML = "<p> No watches found. Go track some time! </p>";
        return;
    }

    let categories = Object.fromEntries(
        Object.entries(hierarchyData).filter(([id, data]) => !data.parent)
    );

    let container = document.getElementById('dashboard-container');
    container.innerHTML = "";

    for (const [catId, catData] of Object.entries(categories)) {
        let table = document.createElement('table');
        table.classList.add('category-table');

        let caption = document.createElement('caption');
        caption.innerHTML = `<strong> ${catData.name} </strong>`;

        table.appendChild(caption);

        table.innerHTML += `
            <thead>
                <tr>
                <th> Watch </th>
                <th> Total Time </th>
                </tr>
            </thead>
            <tbody id = 'category-${catId}-body'></tbody>
        `;
        container.appendChild(table);

        for (const subId of hierarchyData[catId].subcategories) {
            if (hierarchyData[subId].is_watch) continue;
            let name = hierarchyData[subId].name;

            for (const watchId of hierarchyData[subId].subcategories) {
                createTableRow(catId, name, watchId);
            }
        }

        for (const watchId of hierarchyData[catId].subcategories) {
            if (!hierarchyData[watchId].is_watch) continue;
            createTableRow(catId, null, watchId);
        }
    }
}

function createTableRow(catId, subcatName, watchId) {
    if (!subcatName) subcatName = '';
    else subcatName += '/';

    let watchName = hierarchyData[watchId].name;
    let displayTime = format(hierarchyData[watchId].total_time);

    let tr = document.createElement('tr');

    let watchNameData = document.createElement('td');
    tr.appendChild(watchNameData);

    let timeData = document.createElement('td');
    tr.appendChild(timeData);

    let span = document.createElement('span');
    span.style.color = '#aaa';
    span.textContent = subcatName;
    watchNameData.appendChild(span);

    timeData.textContent = displayTime;
    watchNameData.appendChild(document.createTextNode(watchName));

    document.getElementById(`category-${catId}-body`).appendChild(tr);
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