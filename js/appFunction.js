import { names, items, namePreset, tableData, itemPresetPath } from "./js/constants.js";
import { createCheckboxes, updateUI } from "./js/ui.js";
import { loadDataFromLocalStorage, saveDataToLocalStorage, updatePresetsTable } from "./js/dataManagement.js";

// Initialize autocomplete for Name and Drop inputs.
export function initializeAutocomplete() {
    $("#newNameInput").val(''); // Clears the name input field
    $("#newDropInput").val(''); // Clears the drop input field
    // Convert sets to arrays for the source of autocomplete
    let namesArray = Array.from(names);
    let itemsArray = Array.from(items);

    // Initialize autocomplete with a minimum length of 0
    $("#newNameInput").autocomplete({
        source: namesArray,
        minLength: 0
    }).focus(function(){
        // Open the autocomplete menu on input focus
        $(this).autocomplete("search", "");
    });

    $("#newDropInput").autocomplete({
        source: itemsArray,
        minLength: 0
    }).focus(function(){
        // Open the autocomplete menu on input focus
        $(this).autocomplete("search", "");
    });
}

export function refreshAutocompleteSources() {
    let namesArray = Array.from(names);
    let itemsArray = Array.from(items);
    $("#newNameInput").autocomplete('option', 'source', namesArray);
    $("#newDropInput").autocomplete('option', 'source', itemsArray);
}

export function addNamePreset() {
    var presetName = $('#presetInput').val().trim();
    if (presetName && !namePreset.has(presetName)) {
        namePreset.add(presetName);
        names.add(presetName); 
        addPresetToTable(presetName);
        $('#presetInput').val(''); 
        updateUniqueValues();
        refreshAutocompleteSources();
    };
    saveDataToLocalStorage();
}

function addPresetToTable(name) {
    $('#presetsTable tbody').append(`<tr><td><span class="delete-icon" data-name="${name}">❌</span> ${name}</td></tr>`);
}

export function deleteNamePreset(name) {
    namePreset.delete(name);

    // Check if the name is still present in the tableData
    const isNameInTableData = tableData.some(row => row.name === name);
    if (!isNameInTableData) {
        names.delete(name);
    }

    // Update only the presets table and refresh autocomplete sources
    updatePresetsTable();
    refreshAutocompleteSources();
    saveDataToLocalStorage();
}

export function loadItemPresets() {
    $.getJSON(itemPresetPath)
    .done(function(data) {
        // Update existing object instead of redefining
        Object.assign(itemPresets, data);
        createCheckboxes();
        loadDataFromLocalStorage();
    })
    .fail(function(jqxhr, textStatus, error) {
        console.error("Error loading presets: " + textStatus + ", " + error);
    });
}

export function updateUniqueValues() {
    // Reset the sets
    names.clear();
    items.clear();

    // Add items from table data and name presets
    tableData.forEach(row => {
        names.add(row.name);
        items.add(row.item);
    });
    namePreset.forEach(name => {
        names.add(name);
    });

    // Dynamically add items from checked presets
    Object.keys(itemPresets).forEach(presetKey => {
        if ($(`#${presetKey}Checkbox`).is(":checked")) {
            itemPresets[presetKey].forEach(item => items.add(item));
        }
    });

    // Update the UI to reflect changes
    updateUI();
}

// Handles the submit action, validates input, and updates data and UI.
export function handleSubmit() {
    const name = $("#newNameInput").val().trim();
    const item = $("#newDropInput").val().trim();
    const date = $("#dateInput").val();

    if (!name || !item || !date) {
        alert("Please fill in all the fields!");
        return;
    }

    names.add(name);
    items.add(item);
    tableData.push({ name, item, date });

    updateUI();
    saveDataToLocalStorage();
}