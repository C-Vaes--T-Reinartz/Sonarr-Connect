/*
 ** Sonnarr Extention
 ** Shows upcoming and missed episodes.
 */

var sonarr = {
  settings : {
    wanted : "api/wanted/missing?page=1&pageSize={wantedItems}&sortKey=airDateUtc&sortDir=desc&apikey={apikey}",
    calendar : "api/calendar?page=1&sortKey=airDateUtc&sortDir=desc&start={calendarStartDate}&end={calendarEndDate}&apikey={apikey}",
    series : "api/series?page=1&sortKey=title&sortDir=desc&apikey={apikey}",
    episodes : "api/episode?seriesId={seriesId}&apikey={apikey}",
    history : "api/history?page=1&pageSize={historyItems}&sortKey=date&sortDir=desc&apikey={apikey}"
  },
  getData : function(mode, callback, data) {

    // check input in function
    if (sonarr.settings[mode] === undefined) {
      console.error("sonarr.getData mode requires a mode that has been defined in sonarr.settings");
      return false;
    }
    if (callback === undefined || typeof (callback) !== "function") {
      console.error("sonarr.getData callback requires a type of function to be defined");
      return false;
    }

    // check for local data and return the data when possible.
    if (localStorage.getItem(mode) !== 'undefined') {
      var localData = $.parseJSON(localStorage.getItem(mode));
      if (localData !== null) {
        callback(localData);
      }
    }

    var url = "";
    url = app.settings.url + sonarr.settings[mode];

    url = url.replace("{wantedItems}", app.settings.wantedItems);
    url = url.replace("{historyItems}", app.settings.historyItems);
    url = url.replace("{apikey}", app.settings.apiKey);
    url = url.replace("{calendarStartDate}", formatDate(new Date(), null));
    url = url.replace("{calendarEndDate}", formatDate(new Date(), app.settings.numberOfDaysCalendar));

    // set seriesID
    if (mode === "episodes") {
      if (data === undefined) {
        console.error("Cannot get episodes without a seriesId");
        return;
      }
      console.log(data);
      url = url.replace("{seriesId}", data);
    }

    $.getJSON(url, function(remoteData) {
      callback(remoteData);
      // store data in localstorage
      localStorage.setItem(mode, JSON.stringify(remoteData));
    });
  }
}

// format date to be used in api
// TODO improve
function formatDate(date, positiveOffset) {
  if (positiveOffset != null)
    date.setDate(date.getDate() + parseInt(positiveOffset));
  return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate()));
}

var getHistory = {
  connect : function() {
    // check if we have local data
    sonarr.getData("history", getHistory.generate);
  },
  generate : function(data) {
    if (app.settings.mode !== "history") {
      return;
    }
    data = data.records;
    app.cleanList();
    $.each(data, function(index, value) {
      getHistory.add(value);
    });
  },
  add : function(episode) {
    var template = $('.templates #history');
    var event = {
      "downloadFolderImported" : 'Imported',
      "grabbed" : 'grabbed',
      "episodeFileDeleted" : 'deleted file',
    }
    var classe = {
      "downloadFolderImported" : 'label success',
      "grabbed" : 'label secondary',
      "episodeFileDeleted" : 'label alert',
    }
    template.find('#title').html(episode.series.title);
    template.find('#episodeNum').html(formatEpisodeNumer(episode.episode.seasonNumber, episode.episode.episodeNumber));

    template.find('#quality').html(episode.quality.quality.name);

    template.find('#event').html(event[episode.eventType]).attr('class', classe[episode.eventType]);

    template.find('#date').html(moment(new Date(episode.date)).fromNow());

    template.attr("data-episodeId", episode.episode.id);
    template.clone().appendTo(".list");
  }
}

// get calendar of all upcoming shows and seasons
var getCalendar = {
  connect : function() {
    sonarr.getData("calendar", getCalendar.generate);
  },
  generate : function(data) {
    if (app.settings.mode !== "calendar") {
      return;
    }
    console.log("calender");
    app.cleanList();

    getCalendar.addDates();

    $.each(data, function(index, value) {
      getCalendar.addShows(value)
    });
    // getCalendar.bind();
  },
  addDates : function() {
    console.log('addDates');
    // TODO improve how to show code
    var template = $('.templates #calendar').clone();
    template.attr("class", "today");
    template.find('.calendar-date #title').html('Today');
    template.find('.calendar-show .show').empty();
    template.appendTo(".list");

    template = $('.templates #calendar').clone();
    template.attr("class", "tomorrow");
    template.find('.calendar-date #title').html('Tomorrow');
    template.find('.calendar-show .show').empty();
    template.appendTo(".list");

    template = $('.templates #calendar').clone();
    template.attr("class", "later");
    template.find('.calendar-date #title').html('Later');
    template.find('.calendar-show .show').empty();
    template.appendTo(".list");
  },
  addShows : function(serie) {
    // create show
    var show = $('.templates #calendar .calendar-show .show').clone();
    show.find("#title").html(serie.series.title);
    show.find("#episodeName").html(serie.title);
    show.find("#episodeNum").html(formatEpisodeNumer(serie.seasonNumber, serie.episodeNumber));
    show.find("#airDate").html(moment(new Date(serie.airDateUtc)).fromNow());
    var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(0, 0, 0, 0);
    var dayAfterTomorrow = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    if (new Date(serie.airDateUtc).valueOf() >= new Date().setHours(0, 0, 0, 0).valueOf() && new Date(serie.airDateUtc).valueOf() <= tomorrow.valueOf()) {
      show.appendTo(".list .today .calendar-show");
    } else if (new Date(serie.airDateUtc).valueOf() >= tomorrow.valueOf() && new Date(serie.airDateUtc).valueOf() <= dayAfterTomorrow.valueOf()) {
      show.appendTo(".list .tomorrow .calendar-show");
    } else {
      show.appendTo(".list .later .calendar-show");
    }
  },
  bind : function(value) {

  }
}

// get list of all series and seasons
var getSeries = {
  connect : function() {
    sonarr.getData("series", getSeries.generate);
  },
  generate : function(data) {
    if (app.settings.mode !== "series") {
      return;
    }
    app.cleanList();
    $.each(data, function(index, value) {
      getSeries.add(value);
    });
    $('.list .season .episode').remove();
    getSeries.bind();
  },

  add : function(serie) {
    // serie status
    var status = {
      "continuing" : 'label success',
      "ended" : 'label alert'
    }
    // monitor status
    var monitored = {
      "true" : 'fi-bookmark',
      "false" : 'fi-bookmark icon-negative'
    }

    var template = $('.templates #series').clone();
    template.find('.serie-general #title').html(serie.title);
    template.find('.serie-general #network').html(serie.network);
    template.find('.serie-general #status').html(serie.status).attr('class', status[serie.status]);
    // add identifier to toggle season panel
    template.attr('serie-id', serie.id);
    // remove season line to prevent double first line
    template.find('.serie-seasons').empty();

    template.appendTo(".list");
    

    // add line per season
    $.each(serie.seasons.sort(seasonComparator), function(index, value) {
      var season = $('.templates #series .serie-seasons .season').clone();
      if (value.seasonNumber == 0)
        season.find('#seasonNumber').html('Specials');
      else
        season.find('#seasonNumber').html('Season ' + value.seasonNumber);
      season.find('#monitored').attr('class', monitored[value.monitored]).attr('title', 'monitored: ' + value.monitored.toString());
      season.addClass("S" + value.seasonNumber);
      season.appendTo('div[serie-id="' + serie.id + '"] .serie-seasons');
    });

  },
  bind : function() {
    $('.series .serie-general').unbind('click').on('click', function() {
      var seriesId = $(this).parent().attr('serie-id');
      getEpisodes.forSeries(seriesId);
      $(this).parent().find(".serie-seasons").toggle();
    });
    $('.series .season').unbind('click').on('click', function() {
      if ($(this).hasClass('show')) {
        $(this).removeClass('show');
      } else {
        $(this).parent().removeClass("show");
        $(this).addClass('show');
      }
    });
  }
}

// get list of all series and seasons
var getEpisodes = {
  forSeries : function(seriesId) {
    sonarr.getData("episodes", getEpisodes.generate, seriesId);
  },
  generate : function(data) {
    if (app.settings.mode !== "series") {
      return;
    }
    $.each(data, function(index, value) {
      getEpisodes.add(value);
    });
  },
  add : function(data) {
    var template = $('.templates #series .episode').clone();
    template.find('#episode-name').html(data.title);
    template.find("#episode-num").html(formatEpisodeNumer(data.seasonNumber, data.episodeNumber));
    template.appendTo('[serie-id="' + data.seriesId + '"] .season.S' + data.seasonNumber);
  },
  bind : function() {

  }
}

// comparator to sort seasons by seasonNumber
function seasonComparator(a, b) {
  if (a.seasonNumber < b.seasonNumber)
    return -1;
  else if (a.seasonNumber > b.seasonNumber)
    return 1;
  return 0;
}

var getWantedEpisodes = {
  connect : function() {
    sonarr.getData("wanted", getWantedEpisodes.generate);
  },
  generate : function(data) {
    if (app.settings.mode !== "wanted") {
      return;
    }
    var totalRecords = data.totalRecords;
    data = data.records;
    app.cleanList();

    $.each(data, function(index, value) {
      getWantedEpisodes.add(value);
    });
    // set num items in button
    $('.menu .wanted .num').html(totalRecords.toString());
    getWantedEpisodes.click();
  },
  add : function(episode) {
    var template = $('.templates #wanted');
    var date = {
      day : episode.airDate.substring(8, 10),
      month : episode.airDate.substring(5, 7)
    }
    var month = {
      '01' : 'jan',
      '02' : 'feb',
      '03' : 'mar',
      '04' : 'apr',
      '05' : 'may',
      '06' : 'jun',
      '07' : 'jul',
      '08' : 'aug',
      '09' : 'sep',
      '10' : 'okt',
      '11' : 'nov',
      '12' : 'dec',
    }
    template.find('#title').html(episode.series.title);
    template.find('#episodeName').html(episode.title);
    template.find('#episodeNum').html("Search <br/>" + formatEpisodeNumer(episode.seasonNumber, episode.episodeNumber));

    template.attr("data-episodeId", episode.id);

    template.find('#day').html(date.day);
    template.find('#month').html(month[date.month]);
    template.clone().appendTo(".list");
  },
  searchEpisode : function(episodeId) {
    if (episodeId < 1) {
      return false;
    }
    var url = app.settings.url + "api/Command?apikey=" + app.settings.apiKey;
    console.log(url);
    $.ajax({
      type : "get",
      url : url,
      data : {
        name : "episodesearch",
        episodeIds : episodeId
      }
    });
  },
  click : function() {
    $(".wanted .button").click(function() {
      var episodeId = $(this).parentsUntil('.wanted').attr("data-episodeId");
      $(this).parentsUntil('.wanted').animate({
        'opacity' : '0.5'
      });
      getWantedEpisodes.searchEpisode(episodeId);
    });
  }
}

// set variable from chrome storage option fields
// stored in chrome.storage.
function getOptions() {
  chrome.storage.sync.get({
    apiKey : app.settings.apiKey,
    url : app.settings.url,
    numberOfDaysCalendar : app.settings.numberOfDaysCalendar,
    wantedItems : app.settings.wantedItems,
    historyItems : app.settings.historyItems,
    calendarEndDate : app.settings.calendarEndDate
  }, function(items) {
    app.settings.apiKey = items.apiKey;
    app.settings.url = items.url;
    app.settings.mode = "wanted";
    app.settings.numberOfDaysCalendar = items.numberOfDaysCalendar;
    app.settings.wantedItems = items.wantedItems;
    app.settings.historyItems = items.historyItems;
    app.settings.calendarEndDate = items.calendarEndDate;
    app.run();
    console.log('get options from chrome storage');
  });
}

// buttons on menu at the bottom of the extension
var bottomMenu = {
  bind : function() {
    $('.bottom-menu a').unbind("click");
    $('#sonarr-url-link').click(bottomMenu.openSonarrUrl);
    $('#options-link').click(bottomMenu.openOptions);
    $('#refresh-link').click(bottomMenu.refreshList);
  },
  openOptions : function() {
    chrome.tabs.create({
      url : "options.html"
    });
  },
  openSonarrUrl : function() {
    chrome.tabs.create({
      url : app.settings.url
    });
  },
  refreshList : function() {
    app.run();
    background.getItemsInHistory();
  }
}

// buttons on menu at the top of the extension
var menu = {
  bind : function() {
    $('.menu .item').unbind("click").click(function() {
      var mode = $(this).attr('data-mode');
      if (app.settings.mode !== mode) {
        // change active item
        $('.menu .item').removeClass('active');
        $(this).addClass('active');
        // change mode
        app.settings.mode = mode;
        console.log(mode);
        // rerun app
        app.run();
      }
    });
  }
}

// save tabs to localstorage for caching
function setLocalStorage() {
  if (localStorage.getItem('wanted') === null) {
    localStorage.setItem('wanted', undefined);
  }
  if (localStorage.getItem('calendar') === null) {
    localStorage.setItem('calendar', undefined);
  }
  if (localStorage.getItem('series') === null) {
    localStorage.setItem('series', undefined);
  }
  if (localStorage.getItem('history') === null) {
    localStorage.setItem('history', undefined);
  }
}

// format episodenumbers to match scene formatting
var formatEpisodeNumer = function(seasonNumber, episodeNumber) {
  var episodeNum = "S" + (seasonNumber.toString().length === 1 ? '0' : '') + seasonNumber + "E" + (episodeNumber.toString().length === 1 ? '0' : '') + episodeNumber;
  return episodeNum;
}

var app = {
  settings : {
    apiKey : '',
    url : '',
    mode : 'getOptions',
    numberOfDaysCalendar : 7,
    wantedItems : 15,
    historyItems : 15,
    calendarEndDate : (new Date() + 7)
  },
  run : function() {
    // prepare local storage
    setLocalStorage();

    if (app.settings.mode == 'getOptions' || app.settings.apiKey === '' || app.settings.url === '') {
      getOptions();
      return false;
    }
    if (app.settings.mode === "wanted") {
      getWantedEpisodes.connect();
    } else if (app.settings.mode === "calendar") {
      getCalendar.connect();
    } else if (app.settings.mode === "series") {
      getSeries.connect();
    } else if (app.settings.mode === "history") {
      getHistory.connect();
    }
    // bind actions to the menu
    menu.bind();
    // bind bottom menu
    bottomMenu.bind();
  },
  cleanList : function() {
    // clean list
    $(".list *").remove();
  }
}

// run app when extension is opened
app.run();
