import {loadDataFromLocalStorage} from './dataManagement.js'
import {setupEnterKeyListeners, setupEventListeners} from './listeners.js'
import {loadItemPresets} from './appFunction.js'
import {initializeDateInput} from './ui.js'

// Initialization when the document is ready
$(document).ready(function() {
    loadDataFromLocalStorage();
    setupEventListeners();
    setupEnterKeyListeners();
    loadItemPresets();
    initializeDateInput();
});