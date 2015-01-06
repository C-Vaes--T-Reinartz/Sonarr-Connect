/**
 * 
 * @author C.Vaes
 */

/**
 * Test connection to sonarr server with api key. api/system/status call is used
 */
function test_connection() {
var apiKey = document.getElementById('apiKey').value;
var url = document.getElementById('url').value;
var status = document.getElementById('connectionStatus');
        $.ajax({
        	url: url + 'api/system/status?apiKey=' + apiKey,
         statusCode: {
         200: function() {
            status.textContent = 'Connected!';
         },
		 401: function() {
			status.textContent = 'Credentials or url are not correct';
			},
		404: function() {
		status.textContent = 'Sonarr is not running on this address';
		}
      }
	  });	  
}

/**
 * Save settings to chrome storage
 */
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

/**
 * Restore settings from chrome storage
 */
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
//add listeners to buttons
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);
document.getElementById('testConnection').addEventListener('click',test_connection);