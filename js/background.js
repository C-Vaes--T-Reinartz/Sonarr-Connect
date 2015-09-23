var background = {
  options : {},
  standalone : function() {
    app.settings.mode = "wanted";
    sonarr.getData("wanted", background.getItemsInHistory);
  },
  getItemsInHistory : function (data) { 
    //    data = $.parseJSON(localStorage.getItem('wanted'));
    var num = data.totalRecords.toString();
    background.setBadge(num);
  },
  setBadge : function (num) {
    console.log(num);
    if (background.options.showBadge == "true" || num > 0)
      chrome.browserAction.setBadgeText({text: num});
    else 
      chrome.browserAction.setBadgeText({text: ''});
  },
  setTimer : function (data) { 
    // set interval
    console.log(data);
    background.options = data;
    var min = Number(data.backgroundInterval);
    chrome.alarms.create("getBackgroundData", {periodInMinutes: min } );
    chrome.alarms.onAlarm.addListener(function(alarm) {
      background.standalone();
      console.log(min);
    });
  }
}

$(document).ready(function(){
  prepLocalStorage();
  getOptions(background.setTimer);
});




