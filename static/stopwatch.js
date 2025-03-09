var running = false;
var intervalId, startTime;
var elapsed_at_stop;
var cs, s, m, h;
var hierarchyData;
var listen = true;

async function showSavePopup() {
    document.getElementById('save-time-popup').style.display = 'flex';
    listen = false;
    await loadCategories();
}

async function loadCategories() {
    const resp = await fetch('/get-categories', { method: 'POST' });
    
    if (!resp.ok) {
        console.error('Failed to fetch categories!');
        return;
    }

    hierarchyData = await resp.json();
    console.log(hierarchyData);

    let catSelect = document.getElementById('category-select');
    catSelect.innerHTML = '<option value="">-- Select a Category --</option>'
    for (const [id, data] of Object.entries(hierarchyData)) {
        if (!data.parent) {
            let option = document.createElement('option');
            option.value = id;
            option.textContent = data.name;
            catSelect.appendChild(option);
        }
    }

    document.getElementById('subcategory-select').disabled = true;
    document.getElementById('watch-select').disabled = true;
    document.getElementById('submit-btn').disabled = true;
}

function loadSubcategories() {
    let catId = document.getElementById('category-select').value;
    let subcatSelect = document.getElementById('subcategory-select');

    subcatSelect.innerHTML = '<option value="">-- Select a Subcategory / Watch --</option>';
    document.getElementById('watch-select').innerHTML = '<option value="">-- Select a Watch --</option>';
    document.getElementById('watch-select').disabled = true;
    document.getElementById('submit-btn').disabled = true;

    if (!catId) {
        subcatSelect.disabled = true;
        return;
    }

    let cat = hierarchyData[catId];
    for (const subId of cat.subcategories) {
        let data = hierarchyData[subId];
        let option = document.createElement('option');
        option.value = subId;
        option.textContent = data.name;
        subcatSelect.appendChild(option);
    }

    subcatSelect.disabled = false;
}

function loadWatches() {
    let subcatId = document.getElementById('subcategory-select').value;
    let watchSelect = document.getElementById('watch-select');

    watchSelect.innerHTML = '<option value="">-- Select a Watch --</option>';
    if (!subcatId) {
        watchSelect.disabled = true;
        return;
    }

    let subcat = hierarchyData[subcatId];
    if (subcat.is_watch) {
        document.getElementById('submit-btn').disabled = false;
        return;
    }

    for (const subId of hierarchyData[subcatId].subcategories) {
        let data = hierarchyData[subId];
        let option = document.createElement('option');
        option.value = subId;
        option.textContent = data.name;
        watchSelect.appendChild(option);
    }

    watchSelect.disabled = false;
    document.getElementById('submit-btn').disabled = true;
}

function validate() {
    let e = document.getElementById('watch-select');
    let btn = document.getElementById('submit-btn');

    btn.disabled = e.disabled || !e.value;
}

async function saveTime() {
    let watch_id = document.getElementById('subcategory-select').value;
    if (!hierarchyData[watch_id].is_watch) {
        watch_id = document.getElementById('watch-select').value;
    }

    let time_in_secs = Math.floor(elapsed_at_stop / 1000);
    if (elapsed_at_stop % 1000 >= 500) time_in_secs += 1;

    let resp = await fetch('/save-time', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            watch: watch_id,
            time: time_in_secs
        })
    });

    let message = await resp.text();
    alert(message);

    window.location.href = '/stopwatch';
}

function hideSavePopup() {
    document.getElementById('save-time-popup').style.display = 'none';
    listen = true;
}

function showWatchPopup() {
    hideSavePopup();
    listen = false;

    document.getElementById('create-watch-popup').style.display = 'flex';
    document.getElementById('subcategory-create').disabled = true;
    document.getElementById('watch-name').disabled = true;
    document.getElementById('submit-btn-2').disabled = true;

    // populate category-create
    let dropdown = document.getElementById('category-create');
    dropdown.innerHTML = '<option value="">-- Select a Category --</option>'

    for (const [id, data] of Object.entries(hierarchyData)) {
        if (!data.parent) {
            let option = document.createElement('option');
            option.value = id;
            option.textContent = data.name;
            document.getElementById('category-create').appendChild(option);
        }
    }
}

function loadSubcategories_p2() {
    let catId = document.getElementById('category-create').value;
    
    document.getElementById('subcategory-create').innerHTML = '<option value="">-- Select a Subcategory --</option>'
    if (!catId) {
        document.getElementById('subcategory-create').disabled = true;
        document.getElementById('watch-name').disabled = true;
        document.getElementById('submit-btn-2').disabled = true;
        return;
    }

    let atleast_one_subcat = false;

    for (const subId of hierarchyData[catId].subcategories) {
        if (!hierarchyData[subId].is_watch) {
            atleast_one_subcat = true;
            let option = document.createElement('option');
            option.value = subId;
            option.textContent = hierarchyData[subId].name;
            document.getElementById('subcategory-create').appendChild(option);
        }
    }

    document.getElementById('subcategory-create').disabled = !atleast_one_subcat;
    document.getElementById('watch-name').disabled = false;
}

async function createWatch() {
    let watchName = document.getElementById('watch-name').value.trim();
    let catId = document.getElementById('category-create').value;
    let subcatId = document.getElementById('subcategory-create').value || null;

    if (!watchName || !catId) return;

    let response = await fetch('/create-watch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name: watchName,
            category_id: catId,
            subcategory_id: subcatId
        })
    });

    if (response.status == 409) {
        alert("Watch with this name already exists");
        return;
    }

    hideWatchPopup();
}

function validateNewWatch() {
    let watchName = document.getElementById('watch-name').value.trim();
    let categoryId = document.getElementById('category-create').value;
    let createButton = document.getElementById('submit-btn-2');

    createButton.disabled = !watchName || !categoryId;
}

function hideWatchPopup() {
    // hierarchyData = await ( await fetch('/get-cateories', { method: 'POST' }) ).json();
    document.getElementById('create-watch-popup').style.display = 'none';
    showSavePopup();
}

function showCategoryPopup() {
    document.getElementById('create-watch-popup').style.display = 'none';
    document.getElementById('new-category-popup').style.display = 'flex';

    let dropdown = document.getElementById('category-parent');
    dropdown.innerHTML = '<option value="null">No Parent</option>';
    
    for (const [id, data] of Object.entries(hierarchyData)) {
        if (!data.parent && data.name !== 'Uncategorised') {
            let option = document.createElement('option');
            option.value = id;
            option.textContent = data.name;
            dropdown.appendChild(option);
        }
    }
}

function validateNewCat() {
    let parent = document.getElementById('category-parent').value;
    let name = document.getElementById('category-name').value.trim();
    let btn = document.getElementById('submit-btn-3');

    if (!name) {
        btn.disabled = true;
        return;
    }

    if (parent === "null") { // check 0-level categories with same name
        for (const [id, data] of Object.entries(hierarchyData)) {
            if (data.parent === null && data.name === name) {
                btn.disabled = true;
                return;
            }
        }
    }

    else {
        for (const subId of hierarchyData[parent].subcategories) {
            if (hierarchyData[subId].name === name) {
                btn.disabled = true;
                return;
            }
        }
    }

    btn.disabled = false;
}

async function createCategory() {
    validateNewCat();
    if (document.getElementById('submit-btn-3').disabled) return;

    let name = document.getElementById('category-name').value.trim();
    let parent = document.getElementById('category-parent').value;

    let resp = await fetch(
        '/create-category', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name,
                parent: parent
            })
        }    
    );
    
    hideCategoryPopup();
}

async function hideCategoryPopup() {
    const resp = await fetch('/get-categories', { method: 'POST' });
    hierarchyData = await resp.json();
    document.getElementById('new-category-popup').style.display = 'none';
    // document.getElementById('create-watch-popup').style.display = 'flex';
    showWatchPopup();
}

function stop() {
    elapsed_at_stop = Date.now() - startTime;

    var elem = document.getElementById('btn');
    elem.style = "display: flex;";

    var elem = document.getElementById('stopwatch-text');
    elem.style = "color: #d90e0eb9;";

    elem = document.getElementById('centi-secs');
    elem.style = "color: #d90e0eb9;";
    
    running = false;
    clearInterval(intervalId);
}

function start() {
    startTime = Date.now();

    var elem = document.getElementById('btn');
    elem.style = "display: none;";

    var elem = document.getElementById('stopwatch-text');
    elem.style = "color: #1fec1fb9;";

    var elem2 = document.getElementById('centi-secs');
    elem2.style = "color: #1fec1fb9;";

    function updater() {
        elapsed = Date.now() - startTime;
        cs = Math.floor(elapsed / 10) % 100;
        s = Math.floor(elapsed / 1000) % 60;
        m = Math.floor(elapsed / 60000) % 60;
        h = Math.floor(elapsed / 3600000);

        document.getElementById('stopwatch-text').innerHTML = `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
        document.getElementById('centi-secs').innerHTML = Math.floor(cs / 10) + "" + (cs % 10);
    }
    
    running = true;
    intervalId = setInterval(updater, 10);
}

document.addEventListener('click', function() {
    if (!listen) return;

    if (running) { stop(); }
    else { start(); }
});