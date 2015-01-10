var background = {
standalone : function() {
    app.run();
},
  getItemsInHistory : function () { 
    data = $.parseJSON(localStorage.getItem('wanted'));
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
  background.standalone.getItemsInHistory();
});
