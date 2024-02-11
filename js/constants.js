// Set collections to store unique names and items, and an array for table data.
export let names = new Set();
export let items = new Set();
export let namePreset = new Set();
export let itemPresets = {};
export let tableData = [];

// path to item presets
export let itemPresetPath = "./data/itemPresets.json"