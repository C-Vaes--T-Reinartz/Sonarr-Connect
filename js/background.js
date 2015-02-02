var background = {
  standalone : function() {
    sonarr.getData("wanted", background.getItemsInHistory);
  },
  getItemsInHistory : function (data) { 
    //    data = $.parseJSON(localStorage.getItem('wanted'));
    console.log(data);
    var num = data.totalRecords.toString();
    background.setBadge(num);
    console.log(num);
  },
  setBadge : function (num) {
    chrome.browserAction.setBadgeText({text: num});
  }
}


// prepare local storage
setLocalStorage();
getOptions();
app.settings.mode = "history"
//background.standalone();


// set interval 
chrome.alarms.create("getBackgroundData", {periodInMinutes: 1} );
chrome.alarms.onAlarm.addListener(function(alarm) {
  background.standalone();
});
