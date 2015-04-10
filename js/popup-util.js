function calculateEpisodeQuoteColor(episodeFileCount, totalEpisodeCount, monitored, status) {
    var episodeQuote = {
        'continuing' : 'label regular',
        'ended' : 'label success',
        'missing-monitored' : 'label alert',
        'missing-not-monitored' : 'label warning'
    }

    var label = ""
    if (episodeFileCount == totalEpisodeCount)
        if (status == 'continuing')
            label = episodeQuote['continuing'];
        else
            label = episodeQuote['ended'];
    else if (monitored)
        label = episodeQuote['missing-monitored'];
    else
        label = episodeQuote['missing-not-monitored'];

    return label;
}


function setBadge(num){
  if(app.settings.showBadge && !(num == '0' || num == 0 || num == '')){
    if(typeof num == "number"){
      num = num.toString();
    }
    console.log(typeof(num))
    chrome.browserAction.setBadgeText({text: num});
  } else { 
    badge = new Object();
    badge.text = '';
    chrome.browserAction.setBadgeText(badge);
  }
}

//format date to be used in api
//TODO improve
function formatDate(date, positiveOffset) {
 if (positiveOffset != null)
     date.setDate(date.getDate() + parseInt(positiveOffset));
 return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate()));
}

function getImageUrl(data) {
  if(typeof data == "object"){
    var start = data.url.indexOf('MediaCover')
    var newUrl = app.settings.url + "api/" +  data.url.substring(start) + "&apikey=" + app.settings.apiKey;
    return newUrl;
  } else {
    var noimg = "";
   return  noimg;
  }
}

//format episodenumbers to match scene formatting
var formatEpisodeNumer = function(seasonNumber, episodeNumber) {
    var episodeNum = "S" + (seasonNumber.toString().length === 1 ? '0' : '') + seasonNumber + "E" + (episodeNumber.toString().length === 1 ? '0' : '') + episodeNumber;
    return episodeNum;
}

//comparator to sort seasons by seasonNumber
function seasonComparator(a, b) {
    if (a.seasonNumber < b.seasonNumber)
        return -1;
    else if (a.seasonNumber > b.seasonNumber)
        return 1;
    return 0;
}

// comparator to sort seasons by seasonNumber
function seriesComparator(a, b) {
    if (a.status != b.status) {
        if (a.status < b.status)
            return -1;
        if (a.status > b.status)
            return 1;
        return 0;
    }
    if (a.sortTitle < b.sortTitle)
        return -1;
    if (a.sortTitle > b.sortTitle)
        return 1;
    return 0;
}
