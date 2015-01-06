var background = {
  getItemsInHistory : function () { 
    app.run();
    data = $.parseJSON(localStorage.getItem('wanted'));
    var num = data.records.length.toString();
    background.setBadge(num);
  },
  setBadge : function (num) {
    chrome.browserAction.setBadgeText({text: num});
  }
}

background.getItemsInHistory();


// set interval 
chrome.alarms.create("getBackgroundData", {periodInMinutes: 5} );
chrome.alarms.onAlarm.addListener(function(alarm) {
  console.log(alarm);
  if(name === "getBackgroundData"){
    background.getItemsInHistory();
  }
});
