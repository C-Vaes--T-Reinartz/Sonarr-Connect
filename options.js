// Saves options to chrome.storage
function save_options() {
  var apiKey = document.getElementById('apiKey').value;
  var url = document.getElementById('url').value;
  chrome.storage.sync.set({
    apiKey: apiKey,
    url: url
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value apiKey = '' and url = https://localhost.
  chrome.storage.sync.get({
    apiKey: 'test',
    url: 'test'
  }, function(items) {
    document.getElementById('apiKey').value = items.apiKey;
    document.getElementById('url').value = items.url;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);