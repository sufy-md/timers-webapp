var running = false;
var intervalId, startTime;
var elapsed_at_stop;
var cs, s, m, h;
var hierarchyData;
var listen = true;

function option(value, textContent) {
    let option = document.createElement('option');
    option.value = value;
    option.textContent = textContent;
    return option;
}

async function refresh_hierarchy() {
    const resp = await fetch('/get-categories', { method : 'POST' });
    hierarchyData = await resp.json();
    return true;
}

async function populatePopup(popup_id, depth, allow_watch, parent_element) {
    await refresh_hierarchy();

    popup = document.getElementById(popup_id);
    display_text = "";

    if (depth === 0) display_text = "-- Select a Category --";
    else if (depth === 1 && allow_watch === 1) display_text = "-- Select a Subcategory / Watch --";
    else if (depth === 1 && allow_watch === 0) display_text = "-- Select a Subcategory --";
    else display_text = "-- Select a Watch --";

    popup.innerHTML = "<option value=''>" + display_text + "</option>"

    if (depth === 0) {
        for (const [id, data] of Object.entries(hierarchyData)) {
            if (!data.parent) {
                let opt = option(id, data.name);
                popup.appendChild(opt);
            }
        }
        popup.disabled = false;
        return;
    }

    // depth 1 or depth 2
    parent_id = document.getElementById(parent_element).value;

    if (!parent_id) {
        popup.disabled = true;
        return; // no valid parent found meaning this should be disabled
    }

    popup.disabled = false;

    if (depth === 2) {
        for (const watchId of hierarchyData[parent_id].subcategories) {
            let opt = option(watchId, hierarchyData[watchId].name);
            popup.appendChild(opt);
        }

        return;
    }

    // handling depth 1 now
    for (const subId of hierarchyData[parent_id].subcategories) {
        if (hierarchyData[subId].is_watch) continue;
        let opt = option(subId, hierarchyData[subId].name);
        popup.appendChild(opt);
    }

    if (!allow_watch) return; // done populating
    // if watches allowed depth 1 still has more work to be done

    for (const watchId of hierarchyData[parent_id].subcategories) {
        if (!hierarchyData[watchId].is_watch) continue;
        let opt = option(watchId, hierarchyData[watchId].name);
        popup.appendChild(opt);
    }
}

async function showSavePopup() {
    document.getElementById('save-time-popup').style.display = 'flex';
    listen = false;
    await loadCategories();
}

async function loadCategories() {

    await populatePopup('category-select', 0, 0, null);

    document.getElementById('subcategory-select').disabled = true;
    document.getElementById('watch-select').disabled = true;
    document.getElementById('submit-btn').disabled = true;

}

async function loadSubcategories() {

    await populatePopup('subcategory-select', 1, 1, 'category-select');

    document.getElementById('watch-select').innerHTML = '<option value="">-- Select a Watch --</option>';
    document.getElementById('watch-select').disabled = true;
    document.getElementById('submit-btn').disabled = true;
}

async function loadWatches() {
    let subcatId = document.getElementById('subcategory-select').value;
    let subcat = hierarchyData[subcatId];
    if (subcat.is_watch) {
        document.getElementById('submit-btn').disabled = false;
        return;
    }

    await populatePopup('watch-select', 2, 1, 'subcategory-select');
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

async function showWatchPopup() {
    hideSavePopup();
    listen = false;

    document.getElementById('create-watch-popup').style.display = 'flex';
    document.getElementById('subcategory-create').disabled = true;
    document.getElementById('watch-name').disabled = true;
    document.getElementById('submit-btn-2').disabled = true;

    // populate category-create
    await populatePopup('category-create', 0, 0, null);
}

async function loadSubcategories_p2() {
    let catId = document.getElementById('category-create').value;
    
    let def = '<option value="">-- Select a Subcategory --</option>';
    document.getElementById('subcategory-create').innerHTML = def;
    if (!catId) {
        document.getElementById('subcategory-create').disabled = true;
        document.getElementById('watch-name').disabled = true;
        document.getElementById('submit-btn-2').disabled = true;
        return;
    }

    await populatePopup('subcategory-create', 1, 0, 'category-create');
    let zero_subcat = document.getElementById('subcategory-create').innerHTML === def;

    document.getElementById('subcategory-create').disabled = zero_subcat;
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
    document.getElementById('create-watch-popup').style.display = 'none';
    showSavePopup();
}

function showCategoryPopup() {
    document.getElementById('create-watch-popup').style.display = 'none';
    document.getElementById('new-category-popup').style.display = 'flex';

    let dropdown = document.getElementById('category-parent');
    dropdown.innerHTML = '<option value="null">No Parent</option>';
    
    for (const [id, data] of Object.entries(hierarchyData)) {
        if (!data.parent && data.name !== 'Uncategorised') { // handling this one manually
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

    if (parent === "null" || !parent) { // check 0-level categories with same name
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
    await refresh_hierarchy();
    document.getElementById('new-category-popup').style.display = 'none';
    showWatchPopup();
}

function stop() {
    elapsed_at_stop = Date.now() - startTime;

    var elem = document.getElementById('btn');
    elem.style.display = "flex";

    var text = document.getElementById('stopwatch-text');
    text.classList.remove('glow-idle', 'glow-running');
    text.classList.add('glow-stopped');

    var centiSecs = document.getElementById('centi-secs');
    centiSecs.style.opacity = "0.5";
    
    // Re-enable navigation links
    var dashLink = document.getElementById('dashboard-link');
    var logoutLink = document.querySelector('.logout');
    if (dashLink) dashLink.classList.remove('inactive');
    if (logoutLink) logoutLink.classList.remove('inactive');
    
    running = false;
    clearInterval(intervalId);
}

function start() {
    startTime = Date.now();

    var elem = document.getElementById('btn');
    elem.style.display = "none";

    var text = document.getElementById('stopwatch-text');
    text.classList.remove('glow-idle', 'glow-stopped');
    text.classList.add('glow-running');

    var centiSecs = document.getElementById('centi-secs');
    centiSecs.style.opacity = "0.8";
    
    // Disable navigation links
    var dashLink = document.getElementById('dashboard-link');
    // var logoutLink = document.querySelector('.logout');
    if (dashLink) dashLink.classList.add('inactive');
    // if (logoutLink) logoutLink.classList.add('inactive');
    
    function updater() {
        elapsed = Date.now() - startTime;
        cs = Math.floor(elapsed / 10) % 100;
        s = Math.floor(elapsed / 1000) % 60;
        m = Math.floor(elapsed / 60000) % 60;
        h = Math.floor(elapsed / 3600000);
        
        const timeHTML = `
        <span class="num">${h}</span><span class="unit">h</span>
        <span class="num">${m.toString().padStart(2, '0')}</span><span class="unit">m</span>
        <span class="num">${s.toString().padStart(2, '0')}</span><span class="unit">s</span>
        `;
        
        document.getElementById('stopwatch-text').innerHTML = timeHTML;
        document.getElementById('centi-secs').innerHTML = Math.floor(cs / 10) + "" + (cs % 10);
    }
    
    running = true;
    intervalId = setInterval(updater, 10);
}

async function togglebg() {
    let newBg = await fetch('/toggle-bg', { method: 'POST' });
    let data = await newBg.json();
    newBg = data['background'];
    document.body.style.backgroundImage = `url('${newBg}')`;
}

document.addEventListener('click', function() {
    if (!listen) return;

    if (running) { stop(); }
    else { start(); }
});