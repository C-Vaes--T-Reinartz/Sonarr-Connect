/*
 ** Sonnarr Extention
 ** Shows upcoming and missed episodes.
 */
var sonarr = {
  settings : {
    wanted : "api/wanted/missing?page=1&pageSize={wantedItems}&sortKey=airDateUtc&sortDir=desc&apikey={apikey}",
    calendar : "api/calendar?page=1&sortKey=airDateUtc&sortDir=desc&start={calendarStartDate}&end={calendarEndDate}&apikey={apikey}",
    series : "api/series?page=1&sortKey=title&sortDir=desc&apikey={apikey}",
    episode : "api/episode/\{episodeId}?apikey={apikey}",
    episodes : "api/episode?seriesId={seriesId}&apikey={apikey}",
    history : "api/history?page=1&pageSize={historyItems}&sortKey=date&sortDir=desc&apikey={apikey}",
    manualDownload : "/api/release?episodeId={episodeId}&sort_by=releaseWeight&order=asc&apikey={apikey}"
  },
  getData : function(mode, callback, id) {

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
    if (localStorage.getItem(mode) != "undefined" && mode != 'episode' && mode != 'episodes') {
      callback($.parseJSON(localStorage.getItem(mode)));
    }

    var  url = sonarr.settings[mode];

    url = url.replace("{wantedItems}", app.settings.wantedItems);
    url = url.replace("{historyItems}", app.settings.historyItems);
    url = url.replace("{apikey}", app.settings.apiKey);
    url = url.replace("{calendarStartDate}", formatDate(new Date(), null));
    url = url.replace("{calendarEndDate}", formatDate(new Date(), app.settings.numberOfDaysCalendar));

    url = url.replace("{seriesId}", id);
    url = url.replace("\{episodeId\}", id);

    url = app.settings.url + url;

    $.getJSON(url, function(remoteData) {
      localStorage.setItem(mode, JSON.stringify(remoteData));
      if(app.settings.mode == mode || mode == 'episode' || mode == 'episodes'){
        callback(remoteData);
      }
    });
  },
  setData : function (mode, data, callback){ 
    var url = sonarr.settings[mode];
    url = url.replace("{seriesId}", data.id);
    url = url.replace("{episodeId}", "" );
    url = url.replace("{apikey}", app.settings.apiKey);

    url = app.settings.url + url;

    $.ajax({
      type: "put",
      url: url,
      data: JSON.stringify(data),
      processData: true
    }).done(function( data ) {
      console.log(data);

      if (callback !== undefined && typeof (callback) === "function") {
        callback(data);
      }
    });
  },
  setEpisodeData: function (episodeData, callback){ 
    sonarr.setData('episode', episodeData, callback);
  }, 
  setSeasonData : function (seasonData){
    sonarr.setData('season', seasonData, callback);
  }

}

var create = {
  /*
     * * @param data: json {episodeNumber, seasonNumber, title, airDateUtc,
     * monitored, status, episodeQuality, seriesTitle, episodeId, seriesId} * @param mode: string
     * 'app-mode'
     */
  episode : function(data, mode) {
    var html = '';
    // short copy
    var event = {
      "downloadFolderImported" : 'Imported',
      "grabbed" : 'Grabbed',
      "episodeFileDeleted" : 'Deleted',
      "hide" : '',
      "downloaded": "downloaded",
      "missing" : 'Missing ',
      "toBeAired" : '',
      "downloadFailed" : 'Failed'
    }
    // add class depening on current status
    var classes = {
      "downloadFolderImported" : 'label success',
      "downloaded" : 'label success',
      "grabbed" : 'label secondary',
      "episodeFileDeleted" : 'label alert',
      "hide" : 'hide',
      "missing" : 'label secondary',
      "toBeAired" : 'tba',
      "downloadFailed" : 'label alert'
    }

    var episode = $('.templates #episode').clone();

    // episodeShowTitle
    if (data.seriesTitle !== null) {
      episode.find(".series-title").html(data.seriesTitle);
      episode.find(".series-title").attr('data-series-id', data.seriesId );;
    } else {
      episode.find(".episode-show-title").addClass(classes['hide']);
    }

    episode.find('.episode').addClass('season-' + data.seasonNumber);
    episode.find('.episode').addClass('episode-' + data.episodeNumber);
    episode.find('.episode, .watched-indicator').attr('data-episode-id', data.id);

    // episode title
    episode.find(".episodenum").html(formatEpisodeNumer(data.seasonNumber, data.episodeNumber));
    episode.find(".episodename").html(data.title);

    // change font size to fit
    if (data.title.length > 20) {
      episode.find(".episodename").css({
        'font-size' : '.9rem'
      });
    }

    // episode info
    episode.find(".episode-info .status").html(event[data.status]);
    var aired = moment(new Date(data.airDateUtc)).fromNow();
    if(data.episodeQuality === undefined){
      if(aired.indexOf("in") > -1){aired = "Airs " + aired;} else { aired = "Aired " + aired; }
    }
    episode.find(".episode-info .date").html(aired);
    // quality
    if (data.episodeQuality !== undefined) {
      episode.find(".episode-info .status").prepend("<span class='label secondary'> " + data.episodeQuality + "</span>");
    }
    // change classes
    episode.find(".episode-info .status").attr('class', classes[data.status]);

    // monitored status
    if (data.monitored) {
      episode.find('.watched-indicator').addClass('');
    } else {
      episode.find('.watched-indicator').addClass('icon-negative');
    }

    // change html to string and return it.
    html = episode.html();
    episode.remove();
    return html;
  },
  episodeClicks: function (){
    $('.series-title').unbind('click').on('click', function(){
      var seriesId = $(this).data('series-id');
      getSeries.makeShow(seriesId);
    });
    $('.watched-indicator').unbind('click').on('click', function(){
      var episodeId = $(this).data('episode-id');
      episodeMonitored.set(episodeId);
    });
  },
  season : function(data) {
    var html = '';
    return html;
  },
  /*
     * *generate show * @param showdata json {}
     */
  show : function(showdata) {
    // monitor status
    var episodeQuote = {
      "continuing" : 'label regular',
      "ended" : 'label success',
      "missing-monitored" : 'label alert',
      'missing-not-monitored' : 'label warning'
    }
    var html = '';
    var show = $('.templates .show.template').clone();
    // images
    show.find(".poster img").attr('src', getImageUrl(showdata.images[2]));
    show.find(".banner").css("background-image", 'url(" '+ getImageUrl(showdata.images[1]) + '")');

    // texts
    show.find("#title").html(showdata.title);
    if (showdata.title.length > 25) {
      show.find("#title").css({
        'font-size' : '1.3rem'
      });
    }
    show.find("#network").html(showdata.network);
    show.find("#start-year").append("Started " + showdata.year);
    show.find("#show-status").append(showdata.status);
    show.find("#seasons").append("Seasons " + showdata.seasonCount);
    show.find("#episodes").html(showdata.episodeFileCount + "/" + showdata.episodeCount).attr('class', calculateEpisodeQuoteColor(showdata.episodeFileCount, showdata.episodeCount, showdata.monitored, showdata.status));
    show.find("#air-time").append(showdata.airTime);
    show.find("#summary").html(showdata.overview);

    // change html to string and return it.
    html = show.html();
    show.remove();
    return html;
  }

}



var episodeMonitored = {
  set: function (episodeId){
    episodeMonitored.getData(episodeId);

  },
  getData: function (episodeId){
    console.log('getdata');
    sonarr.getData("episode", episodeMonitored.setData, episodeId)
  },
  setData: function (data){
    console.log('setdata');
    if(data.monitored){
      data.monitored = false;
    } else { 
      data.monitored = true;
    }
    sonarr.setEpisodeData(data, episodeMonitored.updateEpisode);
  }, 
  updateEpisode : function(data){ 
    console.log(data);
    if(data.monitored == false){
      $('div.watched-indicator[data-episode-id="'+data.id+'"]').addClass('icon-negative');
    } else { 
      $('div.watched-indicator[data-episode-id="'+data.id+'"]').removeClass('icon-negative');
    }
  }
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
    var historyList = '';
    for (var key in data) {
      value = data[key];
      // create data for episode
      props = {
        episodeNumber : value.episode.episodeNumber,
        seasonNumber : value.episode.seasonNumber,
        title : value.episode.title,
        airDateUtc : value.date,
        monitored : value.episode.monitored,
        status : value.eventType,
        episodeQuality : value.quality.quality.name,
        id : value.episode.id,
        seriesTitle : value.series.title,
        seriesId : value.series.id

      }
      // getHistory.add(data);
      historyList += create.episode(props, history);
    }
    $('.list').html('<div class="episodes row"></div>')
    $('.list .episodes').append(historyList);
    create.episodeClicks();
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
    //    app.cleanList();

    var todayList = '', tomorrowList = '', laterList = '';

    // calendar list
    getCalendar.addDates();
    var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    tomorrow.setHours(0, 0, 0, 0);
    var dayAfterTomorrow = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    // generate lists
    for (var key in data) {
      episode = data[key];
      props = {
        episodeNumber : episode.episodeNumber,
        seasonNumber : episode.seasonNumber,
        title : episode.title,
        airDateUtc : episode.airDateUtc,
        monitored : episode.monitored,
        status : 'toBeAired',
        seriesTitle : episode.series.title,
        id : episode.id,
        seriesId : episode.series.id,
      }

      if (new Date(episode.airDateUtc).valueOf() >= new Date().setHours(0, 0, 0, 0).valueOf() && new Date(episode.airDateUtc).valueOf() <= tomorrow.valueOf()) {
        if(episode.hasFile){
          props.status = "downloaded"; 
        } else { 
          props.status = "missing"; 
        }

        todayList += create.episode(props, history);
      } else if (new Date(episode.airDateUtc).valueOf() >= tomorrow.valueOf() && new Date(episode.airDateUtc).valueOf() <= dayAfterTomorrow.valueOf()) {
        tomorrowList += create.episode(props, history);
      } else {
        laterList += create.episode(props, history);
      }

    }

    // add episodes to calender
    $(".list .today .calendar-show").html(todayList);
    $(".list .tomorrow .calendar-show").html(tomorrowList);
    $(".list .later .calendar-show").html(laterList);

    getCalendar.bind();
    create.episodeClicks();

    // add wanted list.
    getWantedEpisodes.connect();
  },
  addDates : function() {
    var dates = '';
    // TODO improve how to show code
    var template = $('.templates #calendar');
    template.find('.calendar').attr("class", "wanted calendar");
    template.find('.calendar-date #title').text('Wanted');
    dates += template.html();

    template.find('.calendar').attr("class", "today calendar");
    template.find('.calendar-date #title').text('Today');
    dates += template.html();

    template.find('.calendar').attr("class", "tomorrow calendar");
    template.find('.calendar-date #title').text('Tomorrow');
    dates += template.html();

    template.find('.calendar').attr("class", "later calendar");
    template.find('.calendar-date #title').text('Later');
    dates += template.html();

    if($('.list .today').length == 0){
      $('.list').html(dates);
      $('.wanted .calendar-show').hide();
    }
    // $('.list .show').remove();
  },
  bind : function(value) {
    $('.calendar-date').unbind('click').click(function() {
      $(this).parent().find('.calendar-show').toggle();
    });
  }
}

// get list of all series and seasons
var getSeries = {
  data : {},
  setData: function (data) { 
    getSeries.data = data;
  },
  connect : function() {
    sonarr.getData("series", getSeries.generate);
  },
  generate : function(data) {
    if (app.settings.mode !== "series") {
      return;
    }
    app.cleanList();

    // store data in function
    getSeries.setData(data);

    var episodes = '';
    var shows = '';

    for (var key in data.sort(seriesComparator)) {
      show = data[key];
      shows += getSeries.add(show);
    }

    $(".list").append(shows);

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
    template.find(".serie-general #poster").attr('src', getImageUrl(serie.images[2]));
    template.find(".serie-general #episodesCount").html(serie.episodeFileCount + "/" + serie.episodeCount).attr('class', calculateEpisodeQuoteColor(serie.episodeFileCount, serie.episodeCount, serie.monitored, serie.status));

    // add identifier to toggle season panel
    template.find('.series').attr('serie-id', serie.id);
    template.find('.series').attr('serie-title', serie.sortTitle);
    // remove season line to prevent double first line
    template.find('.serie-seasons').empty();
    if ($('.row.series').length === 0) {
      $(".list").scrollTop(0);
    }
    return template.html();
  },
  makeShow : function(seriesId) {
    var showData = {};
    sonarr.getData("series", getSeries.setData);


    if(getSeries.data[0] === undefined){
      return;
    }

    for (var key in getSeries.data) {
      value = getSeries.data[key];
      if (value.id == seriesId) {
        showData = value;
      }
    }

    html = create.show(showData);
    // clear list
    $('.list').html(html);
    $(".list").scrollTop(0);
    getEpisodes.forSeries(seriesId);
  },
  bind : function() {
    $('.series .serie-general').unbind('click').on('click', function() {
      var seriesId = $(this).parent().attr('serie-id');
      getSeries.makeShow(seriesId);
      $(this).parent().find(".serie-seasons").toggle();
    });
    getSeries.filter();
  }, 
  filter : function() { 
    /*add filter option*/
    var filter = '<input id="series-filter" type="text" placeholder="filter by name">' 
    $('.list').prepend(filter);
    $('.row.series').show();
    $( "#series-filter" ).focus();
    $( "#series-filter" ).on('input',function(){
      var title = $(this).val();
      if (title == ""){ 
        title = "undefinedseriestitle";
      }
      if($('.row.series[serie-title*='+title+']').length){
        $('.row.series').hide();
        $('.row.series[serie-title*='+title+']').show();
      } else { 
        $('.row.series').show();
      }
    });
  }
}

// get list of all series and seasons
var getEpisodes = {
  forSeries : function(seriesId) {
    app.settings.mode = 'episodes';

    sonarr.getData("episodes", getEpisodes.generate, seriesId);
  },
  generate : function(data) {
    // clear list
    $('.list .row.episodes .episode').remove();
    var episodes = '';
    var seasons = {};

    // add episodes

    for (var key in data) {
      episode = data[key];
      props = {
        episodeNumber : episode.episodeNumber,
        seasonNumber : episode.seasonNumber,
        title : episode.title,
        airDateUtc : episode.airDateUtc,
        monitored : episode.monitored,
        status : 'missing',
        id : episode.id
      }
      if(episode.hasFile){
        props.status = "downloaded"; 
      }
      seasons = episode.series.seasons;
      // reverse order
      episodes = create.episode(props) + episodes;
    }

    // add seasons to selector
    $('.list .row.episodes #selected-season option').remove();

    for (var key in seasons) {
      season = seasons[key];
      $('.list .row.episodes #selected-season').prepend('<option value="season-' + season.seasonNumber + '">Season ' + season.seasonNumber + '</option>');
    }

    $('.list .row.episodes').append(episodes);
    $('.list .row.episodes .episode').hide();
    getEpisodes.bind();
  },
  bind : function() {
    $('.list .row.episodes #selected-season').on('change', function() {
      $('.list .row.episodes .episode').hide();
      $('.list .row.episodes .episode.' + $(this).val() + '').show();
    });
    $('.list .row.episodes .episode.' + $('.list .row.episodes #selected-season').val()).show();
    create.episodeClicks();
  }
}

var getWantedEpisodes = {
  connect : function() {
    sonarr.getData("wanted", getWantedEpisodes.generate);
  },
  generate : function(data) {
    if (app.settings.mode !== "calendar") {
      // return;
    }
    var totalRecords = data.totalRecords;
    data = data.records;

    // remove wanted items
    $('.list .calendar.wanted .calendar-show > .wanted').remove();
    var wantedList = '';
    // generate list
    for (var key in data) {
      episode = data[key];
      props = {
        episodeNumber : episode.episodeNumber,
        seasonNumber : episode.seasonNumber,
        title : episode.title,
        airDateUtc : episode.airDateUtc,
        monitored : episode.monitored,
        status : 'missing',
        seriesTitle : episode.series.title,
        id : episode.id,
        seriesId : episode.series.id
      }

      if(episode.hasFile){
        props.status = "downloaded"; 
      }

      wantedList += create.episode(props)
    }
    // set num items in button
    $('.calendar.wanted  .calendar-date .num').html("<span>" + totalRecords.toString() + "<span>");

    $('.list .calendar.wanted .calendar-show').html('').append(wantedList);

    create.episodeClicks();
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
  }
}

// set variable from chrome storage option fields
// stored in chrome.storage.
// @param callback : function
function getOptions(callBack) {
  chrome.storage.sync.get(function(items) {
    app.settings.apiKey = items.apiKey;
    app.settings.url = items.url;
    app.settings.mode = "calendar";
    app.settings.numberOfDaysCalendar = items.numberOfDaysCalendar;
    app.settings.wantedItems = items.wantedItems;
    app.settings.historyItems = items.historyItems;
    app.settings.calendarEndDate = items.calendarEndDate;
    app.settings.sonarrConfig = items.sonarrConfig;
    app.settings.backgroundInterval = items.backgroundInterval;

    callBack(items);
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
    background.standalone();
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
function prepLocalStorage() {
  if (localStorage.getItem('wanted') === null) {
    localStorage.setItem('wanted', undefined);
  }
  if (localStorage.getItem('calendar') === null) {
    localStorage.setItem('calendar', undefined);
  }
  if (localStorage.getItem('history') === null) {
    localStorage.setItem('history', undefined);
  }  
  if (localStorage.getItem('series') === null) {
    localStorage.setItem('series', undefined);
  }
}

var app = {
  settings : {
    apiKey : '',
    url : '',
    mode : 'getOptions',
    numberOfDaysCalendar : 7,
    wantedItems : 15,
    historyItems : 15,
    calendarEndDate : (new Date() + 7),
    sonarrConfig : {},
    backgroundInterval: 5
  },
  run : function() {
    // prepare local storage
    prepLocalStorage();

    if (app.settings.mode == 'getOptions') {
      getOptions(app.run);
      return false;
    }

    if(app.settings.apiKey.length < 10 || app.settings.url == ""){
      $(".list").html("<h1>Missing apikey or url please setup config</h1>");
      return false;      
    }

    //if we are in the popup view
    if($(".list").length){
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
    }
  },
  cleanList : function() {
    // clean list
    $(".list *").remove();
  }
}
$(document).ready(function(){
  // run app when extension is opened
  app.run();
});
