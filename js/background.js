var background = {
  standalone : function() {
    app.settings.mode = "wanted";
    sonarr.getData("wanted", background.getItemsInHistory);
  },
  getItemsInHistory : function (data) { 
    //    data = $.parseJSON(localStorage.getItem('wanted'));
    setBadge(data.totalRecords);
  },
  setBadge : function (num) {
    chrome.browserAction.setBadgeText({text: num});
  },
  setTimer : function (data) { 
    // set interval
    app.settings.showBadge = data.showBadge;
    var min = Number(data.backgroundInterval);
    chrome.alarms.create("getBackgroundData", {periodInMinutes: min } );
    chrome.alarms.onAlarm.addListener(function(alarm) {
      background.standalone();
      console.log(min);
    });
  }
}

prepLocalStorage();
getOptions(background.setTimer);




