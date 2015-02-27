/**
 * 
 * @author C.Vaes
 */


/**
* Check if url ends with a /
*/
function checkUrl(url) {

  if(url.substr(-1) !== '/' && url.length > 7)
    url = url + '/';

  if(url.indexOf("http://") == -1 && url.indexOf("https://") == -1)
    url = "http://" + url;

  return url;
}

//empty sonarrConfig object
var sonarrConfig = {};

/**
 * Test connection to sonarr server with api key. api/system/status call is used
 */
function test_connection() {
  var apiKey = document.getElementById('apiKey').value;
  var url = checkUrl(document.getElementById('url').value);
  document.getElementById('url').value = url;
  var status = document.getElementById('connectionStatus');

  status.textContent = 'Connecting to ' + url;
  $.ajax({
    url: url + 'api/system/status?apiKey=' + apiKey,
    statusCode: {
      401: function() {
        status.textContent = 'Credentials or url are not correct';
      },
      404: function() {
        status.textContent = 'Sonarr is not running on this address';
      }
    },
    complete : function(data){
      if(typeof(data.responseJSON) != "undefined"){
        status.textContent = 'Connection successful!';
        getInstallationInformation(data.responseJSON);
        sonarrConfig = data.responseJSON;
      } else { 
        status.textContent = 'Credentials or url are not correct';
      }
    }

  });	  
}

function getInstallationInformation(data) {
  document.getElementById('version').textContent = data.version;
  document.getElementById('branch').textContent = data.branch;
}


/**
 * Save settings to chrome storage
 */
function save_options() {
  var apiKey = document.getElementById('apiKey').value;
  var url = checkUrl(document.getElementById('url').value);
  var numberOfDaysCalendar = document.getElementById('numberOfDaysCalendar').value;
  var wantedItems = document.getElementById('wantedItems').value;
  var historyItems = document.getElementById('historyItems').value;
  var backgroundInterval = document.getElementById('backgroundInterval').value;
  chrome.storage.sync.set({
    apiKey: apiKey,
    url: url,
    numberOfDaysCalendar : numberOfDaysCalendar,
    wantedItems : wantedItems,
    historyItems : historyItems,
    backgroundInterval : backgroundInterval,
    sonarrConfig : sonarrConfig,
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
    apiKey: '',
    url: 'http://localhost:8989',
    numberOfDaysCalendar : 7,
    wantedItems: 15,
    historyItems: 15,
    backgroundInterval : 5
  }, function(items) {
    document.getElementById('apiKey').value = items.apiKey;
    document.getElementById('url').value = items.url;
    document.getElementById('numberOfDaysCalendar').value = items.numberOfDaysCalendar;

    document.getElementById('wantedItems').value = items.wantedItems;
    document.getElementById('historyItems').value = items.historyItems;
    document.getElementById('backgroundInterval').value = items.backgroundInterval;
  });
  
  	document.getElementById('versionNumber').appendChild(document.createTextNode(chrome.runtime.getManifest().version));
}

// add listeners to buttons
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);
document.getElementById('testConnection').addEventListener('click',test_connection);