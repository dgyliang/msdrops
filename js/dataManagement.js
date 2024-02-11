import {names, items, tableData, namePreset} from './constants.js'
import { updateUniqueValues, refreshAutocompleteSources } from './appFunction.js';
import { updateUI } from './ui.js';

// Updates the table displaying recorded data.
export function updateTable() {
    let tableContent = '<tr><th>Name</th><th>Item</th><th>Date</th></tr>';
    tableData.forEach((data, index) => {
        tableContent += `<tr><td><span class="delete-icon" data-index="${index}">❌</span>${data.name}</td><td>${data.item}</td><td>${data.date}</td></tr>`;
    });
    $("#dataTable").html(tableContent);
}

export function updatePresetsTable() {
    let content = '';
    namePreset.forEach(name => {
        content += `<tr><td><span class="delete-icon" data-name="${name}">❌</span> ${name}</td></tr>`;
    });
    $('#presetsTable tbody').html(content);
}

// Deletes a row
export function deleteRow(rowIndex) {
    const confirmDelete = window.confirm("Are you sure you want to delete this row?");
    if (!confirmDelete) {
        return;
    }

    tableData.splice(rowIndex, 1);

    updateTable();
    updateUniqueValues();
    refreshAutocompleteSources();
    updateAnalysis();
    saveDataToLocalStorage();
}

// Clears the table data.
export function clearTable() {
    if (window.confirm("Are you sure you want to clear the entire table?")) {
        // Clear the array without redefining it
        tableData.length = 0;
        updateUniqueValues();
        saveDataToLocalStorage();
        return true;
    } else {
        return false;
    }
}

// Saves the current state of data to local storage.
export function saveDataToLocalStorage() {
    const data = {
        names: [...names],
        items: [...items],
        tableData,
        namePreset: [...namePreset],
        itemPresets: Object.fromEntries(Object.keys(itemPresets).map(key => [key, $(`#${key}Checkbox`).is(":checked")]))
    };
    localStorage.setItem("appData", JSON.stringify(data));
}

// Loads data from local storage and updates the UI.
export function loadDataFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("appData"));
    if (data) {
        names.clear();
        items.clear();
        tableData.length = 0; // Clears the array

        // Add new elements to names and items
        data.names?.forEach(name => names.add(name));
        data.items?.forEach(item => items.add(item));
        tableData.push(...(data.tableData || []));

        // Clear existing set and add new elements to namePreset
        namePreset.clear();
        (data.namePreset || []).forEach(name => {
            namePreset.add(name);
        });

        // Update checkboxes based on stored itemPresets data
        Object.keys(itemPresets).forEach(presetKey => {
            $(`#${presetKey}Checkbox`).prop("checked", data.itemPresets[presetKey]);
        });

        updateUI();
    }
}

// Exports the table data to a CSV file.
export function exportToCSV() {
    if (tableData.length === 0) {
        alert("No data to export!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Name,Item,Date\r\n";
    tableData.forEach(row => {
        csvContent += `${row.name},${row.item},${row.date}\r\n`;
    });

    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `drops_exported_${currentDate}.csv`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Handles CSV file import.
export function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) {
        $("#importInput").val('')
        return;
    }
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const rows = content.split("\r\n");

        if (!isCSVFormattedCorrectly(rows)) {
            $("#importInput").val('')
            return;
        }

        const overwrite = window.confirm("Do you want to overwrite the existing data?");
        if (overwrite) {
            processCSVContent(content, true);
        } else {
            const append = window.confirm("Do you want to append the data instead?");
            if (append) {
                processCSVContent(content, false);
            }
        }
        $("#importInput").val('')
    };

    reader.readAsText(file);
}

// Checks if the CSV is correctly formatted.
function isCSVFormattedCorrectly(rows) {
    // Check if the header is correct
    if (rows[0].trim() !== 'Name,Item,Date') {
        alert('CSV header is incorrect. Expected: Name,Item,Date');
        return false;
    }

    // Check each row for the correct number of columns
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        const columns = rows[i].split(",");
        if (columns.length !== 3 || columns.some(column => column.trim() === '')) {
            alert(`Incorrect format in row ${i + 1}. Each row must have exactly 3 columns.`);
            return false;
        }
    }
    return true;
}

// Processes the content of the CSV file.
function processCSVContent(content, overwrite) {
    if (overwrite) {
         if (!clearTable()){
            return
         };
    }
    const rows = content.split("\r\n").slice(1);
    rows.forEach(row => {
        const [name, item, date] = row.split(",");
        if (name && item && date) {
            names.add(name);
            items.add(item);
            tableData.push({ name, item, date });
        }
    });

    updateUI();
    updateUniqueValues();
    saveDataToLocalStorage();
}

// Updates the analysis section.
export function updateAnalysis() {
    const analysisTable = document.getElementById("analysisTable");
    let tableContent = `
        <tr>
            <th>Name</th>
            <th>Item</th>
            <th>Days Since Last Drop</th>
            <th>Average Days Between Drops</th>
        </tr>
    `;

    let analysisData = calculateDaysSinceLastDrop();
    analysisData.forEach(data => {
        tableContent += `
            <tr>
                <td>${data.name}</td>
                <td>${data.item}</td>
                <td>${data.days}</td>
                <td>${data.avgDays}</td>
            </tr>
        `;
    });

    analysisTable.innerHTML = tableContent;
}

// Calculates days since the last drop and average days between drops.
function calculateDaysSinceLastDrop() {
    let results = [];
    let latestDates = {};
    let dateHistory = {};

    tableData.forEach(row => {
        let key = row.name + '_' + row.item;
        let rowDate = new Date(row.date);

        if (!latestDates[key] || latestDates[key] < rowDate) {
            latestDates[key] = rowDate;
        }

        if (!dateHistory[key]) {
            dateHistory[key] = [];
        }
        dateHistory[key].push(rowDate);
    });

    for (let [key, dates] of Object.entries(dateHistory)) {
        let [name, item] = key.split('_');
        let daysSince = Math.floor((new Date() - latestDates[key]) / (1000 * 60 * 60 * 24));
        let avgDaysBetween = calculateAverageDaysBetween(dates);
        results.push({ name, item, days: daysSince, avgDays: avgDaysBetween });
    }

    return results.sort((a, b) => a.days - b.days);
}

// Calculates the average number of days between recorded drops.
function calculateAverageDaysBetween(dates) {
    if (dates.length < 2) {
        return "N/A";
    }

    dates.sort((a, b) => a - b);
    let totalDays = 0;
    for (let i = 1; i < dates.length; i++) {
        totalDays += (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    }

    return (totalDays / (dates.length - 1)).toFixed(1);
}