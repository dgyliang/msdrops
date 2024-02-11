import { items, tableData } from "./constants.js";
import { updateTable, updatePresetsTable, updateAnalysis, saveDataToLocalStorage } from "./dataManagement.js";
import { initializeAutocomplete, updateUniqueValues } from "./appFunction.js";

export function createCheckboxes() {
    $('#checkbox-container').empty(); // Clear any existing checkboxes
    Object.keys(itemPresets).forEach(presetKey => {
        // Inline capitalize first letter
        const label = $('<label>').text(presetKey.charAt(0).toUpperCase() + presetKey.slice(1).replace(/([A-Z])/g, ' $1'));
        const checkbox = $('<input>', { type: 'checkbox', id: `${presetKey}Checkbox` }).change(function() {
            handleCheckboxChange(this, presetKey);
            saveDataToLocalStorage();
        });

        $('#checkbox-container').append(checkbox, label, '<br>');
    });
}


// Handles changes in checkbox state.
function handleCheckboxChange(checkbox, itemsSetKey) {
    let itemsSet = itemPresets[itemsSetKey] || [];
    if (checkbox.checked) {
        itemsSet.forEach(item => items.add(item));
    } else {
        itemsSet.forEach(item => {
            if (!tableData.some(row => row.item === item)) {
                items.delete(item);
            }
        });
    }

    updateUniqueValues();
    updateUI();
}

// Sets the current date in the date input field.
export function initializeDateInput() {
    var dateInput = document.getElementById('dateInput');
    var today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', '2005-05-11'); // Set the max attribute to 2005-05-11
    dateInput.setAttribute('max', today); // Set the max attribute to today's date
    dateInput.value = today;
}

// Updates the UI components.
export function updateUI() {
    updateTable();
    updatePresetsTable();
    updateAnalysis();
    initializeAutocomplete();
}