var background = {
  standalone : function() {
    sonarr.getData("history", background.getItemsInHistory);
  },
  getItemsInHistory : function (data) { 
    //data = $.parseJSON(localStorage.getItem('wanted'));
    var num = data.totalRecords.toString();
    background.setBadge(num);
    console.log(num);
  },
  setBadge : function (num) {
    chrome.browserAction.setBadgeText({text: num});
  }
}

background.getItemsInHistory();


// set interval 
chrome.alarms.create("getBackgroundData", {periodInMinutes: 5} );
chrome.alarms.onAlarm.addListener(function(alarm) {
  background.standalone();
});
