// Set collections to store unique names and items, and an array for table data.
let names = new Set();
let items = new Set();
let tableData = [];

// Initializes the application when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', function() {
    initializeDateInput();
    loadDataFromLocalStorage();
    setupEventListeners();
    setupKeyPressListeners();
});

// Sets up keypress listeners for adding new options to the select elements.
function setupKeyPressListeners() {
    document.getElementById('newNameInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addNewOption('nameSelect', 'newNameInput');
        }
    });

    document.getElementById('newDropInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addNewOption('dropSelect', 'newDropInput');
        }
    });
}

// Adds a new option to a select element.
function addNewOption(selectId, inputId) {
    var select = document.getElementById(selectId);
    var input = document.getElementById(inputId);
    var newValue = input.value.trim();

    if (newValue && !Array.from(select.options).some(option => option.value === newValue)) {
        var newOption = new Option(newValue, newValue, false, true);
        select.add(newOption);
    }
    input.value = '';
}

// Removes an option from a select element.
function removeOption(selectId, inputId) {
    var select = document.getElementById(selectId);
    var input = document.getElementById(inputId);
    var valueToRemove = input.value.trim();

    var optionExists = Array.from(select.options).some(option => option.value === valueToRemove);

    if (optionExists) {
        for (var i = 0; i < select.options.length; i++) {
            if (select.options[i].value === valueToRemove) {
                select.remove(i);
                break;
            }
        }
    } else {
        alert("Option does not exist and cannot be removed.");
    }

    input.value = '';
}

// Sets the current date in the date input field.
function initializeDateInput() {
    $("#dateInput").val(new Date().toISOString().split('T')[0]);
}

// Sets up event listeners for buttons.
function setupEventListeners() {
    $("#submitButton").on("click", handleSubmit);
    $("#exportButton").on("click", exportToCSV);
    $("#clearTableButton").on("click", confirmAndClearTable);
    setupImportButton();
}

// Sets up the import button and file input for CSV import.
function setupImportButton() {
    $("#importButton").on("click", function() {
        $("#importInput").click();
    });
    $("#importInput").on("change", importFromCSV);
}

// Loads data from local storage and updates the UI.
function loadDataFromLocalStorage() {
    names = new Set(JSON.parse(localStorage.getItem("names")) || []);
    items = new Set(JSON.parse(localStorage.getItem("items")) || []);
    tableData = JSON.parse(localStorage.getItem("tableData")) || [];

    updateUI();
}

// Updates the UI components.
function updateUI() {
    updateTable();
    updateAnalysis();
}

// Handles the submit action, validates input, and updates data and UI.
function handleSubmit() {
    if ((!$("#nameSelect").val() || !$("#dropSelect").val() || !$("#dateInput").val())) {
        alert("Please fill in all the fields!");
        return;
    }

    const name = $("#nameSelect").val().trim();
    const item = $("#dropSelect").val().trim();
    const date = $("#dateInput").val();

    names.add(name);
    items.add(item);
    tableData.push({ name, item, date });

    updateUI();
    saveDataToLocalStorage();
}

// Updates the table displaying recorded data.
function updateTable() {
    const dataTable = document.getElementById("dataTable");
    let tableContent = '<tr><th>Name</th><th>Item</th><th>Date</th></tr>';
    tableData.forEach((data) => {
        tableContent += `<tr><td>${data.name}</td><td>${data.item}</td><td>${data.date}</td></tr>`;
    });
    dataTable.innerHTML = tableContent;
}

// Asks for confirmation before clearing the table.
function confirmAndClearTable() {
    if (window.confirm("Are you sure you want to clear the entire table?")) {
        clearTable();
    }
}

// Clears the table data.
function clearTable() {
    names.clear();
    items.clear();
    tableData = [];
    updateUI();
    saveDataToLocalStorage();
}

// Saves the current state of data to local storage.
function saveDataToLocalStorage() {
    localStorage.setItem("names", JSON.stringify([...names]));
    localStorage.setItem("items", JSON.stringify([...items]));
    localStorage.setItem("tableData", JSON.stringify(tableData));
}

// Exports the table data to a CSV file.
function exportToCSV() {
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
function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        const rows = content.split("\r\n");
        
        if (!isCSVFormattedCorrectly(rows)) {
            alert("Incorrect CSV format.");
            return;
        }

        const overwrite = window.confirm("Overwrite existing data?");
        processCSVContent(content, overwrite);
        event.target.value = '';
    };

    reader.readAsText(file);
}

// Checks if the CSV is correctly formatted.
function isCSVFormattedCorrectly(rows) {
    return rows.every(row => {
        const columns = row.split(",");
        return columns.length === 3 && columns.every(column => column.trim() !== '');
    });
}

// Processes the content of the CSV file.
function processCSVContent(content, overwrite) {
    if (overwrite) {
        clearTable();
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
    saveDataToLocalStorage();
}

// Updates the analysis section.
function updateAnalysis() {
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
