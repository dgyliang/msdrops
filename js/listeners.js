import { handleSubmit, addNamePreset, deleteNamePreset} from "./js/appFunction.js";
import { clearTable, deleteRow, exportToCSV, importFromCSV } from "./js/dataManagement.js";

export function setupEnterKeyListeners() {
    $('#newNameInput, #newDropInput, #dateInput, #presetInput').off('keypress').on('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (this.id === 'presetInput') {
                $('#addPreset').click();
            } else {
                $('#submitButton').click();
            }
        }
    });
}

// Sets up event listeners for buttons.
export function setupEventListeners() {
    $("#submitButton").off("click").on("click", handleSubmit);
    $("#exportButton").on("click", exportToCSV);
    $("#clearTableButton").on("click", clearTable);
    $("#addPreset").on("click", addNamePreset);

    $('#presetsTable tbody').on('click', '.delete-icon', function() {
        const name = $(this).data('name');
        deleteNamePreset(name);
    });

    $('#dataTable').on('click', '.delete-icon', function() {
        const index = $(this).data('index');
        deleteRow(index);
    });

    $("#importButton").on("click", function() {
        $("#importInput").click();
    });
    $("#importInput").on("change", importFromCSV);
}