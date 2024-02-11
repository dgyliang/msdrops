import {loadDataFromLocalStorage} from '/js/dataManagement.js'
import {setupEnterKeyListeners, setupEventListeners} from '/js/listeners.js'
import {loadItemPresets} from '/js/appFunction.js'
import {initializeDateInput} from '/js/ui.js'

// Initialization when the document is ready
$(document).ready(function() {
    loadDataFromLocalStorage();
    setupEventListeners();
    setupEnterKeyListeners();
    loadItemPresets();
    initializeDateInput();
});