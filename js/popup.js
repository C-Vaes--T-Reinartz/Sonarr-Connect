/*
** Sonnarr Extention
** Shows upcoming and missed episodes.
*/

var sonarr = {
  settings: { 
    wanted : "api/wanted/missing?page=1&pageSize={wantedItems}&sortKey=airDateUtc&sortDir=desc&apikey={apikey}", 
    series : "api/series?page=1&sortKey=title&sortDir=desc&apikey={apikey}", 	
    history : "api/history?page=1&pageSize={historyItems}&sortKey=date&sortDir=desc&apikey={apikey}" 
  },
  getData : function (mode, callback) { 

    //check input in function
    if (sonarr.settings[mode] === undefined){
      console.error("sonarr.getData mode requires a mode that has been defined in sonarr.settings");
      return false;
    }
    if (callback === undefined || typeof(callback) !== "function") {
      console.error("sonarr.getData callback requires a type of function to be defined");
      return false;    
    }

    var url = "";
    url = app.settings.url + sonarr.settings[mode];

    url = url.replace("{wantedItems}", app.settings.wantedItems);
    url = url.replace("{historyItems}", app.settings.historyItems);
    url = url.replace("{apikey}", app.settings.apiKey);

    $.getJSON( url , function( data ) {
      callback(data);
      //store data
      if(mode === "wanted"){ 
        localStorage.setItem("wanted", JSON.stringify(data));
      }     
      if(mode === "series"){ 
        localStorage.setItem("series", JSON.stringify(data));
      }    	  
      if(mode === "history"){ 
        localStorage.setItem("history", JSON.stringify(data));
      }
    });
  }
}

var getupcomingEpisodes = {
  connect: function(){

  },
  generate: function(){

  } 
}

var getHistory = {
  connect: function(){
    //check if we have local data
    if(localStorage.getItem("history") !== 'undefined'){
      var historyData = $.parseJSON(localStorage.getItem("history"));
      getHistory.generate(historyData);
    }
    sonarr.getData("history", getHistory.generate);
  },
  generate: function(data){
    if(app.settings.mode !== "history"){
      return; 
    }
    data = data.records;
    app.cleanList();
    $.each(data, function (index, value) {
      getHistory.add(value);
    });
  },
  add : function (episode) {  
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
    template.find('#episodeNum').html(formatEpisodeNumer(episode.episode.seasonNumber,episode.episode.episodeNumber));

    template.find('#quality').html(episode.quality.quality.name);

    template.find('#event').html(event[episode.eventType]).attr('class', classe[episode.eventType]);

    template.find('#date').html(jQuery.format.prettyDate(new Date(episode.date)));

    template.attr("data-episodeId", episode.episode.id);
    template.clone().appendTo( ".list" );
  }
}

//get list of all series
var getSeries = {
  connect: function(){
    //check if we have local data
    if(localStorage.getItem("series") !== 'undefined'){
      var seriesData = $.parseJSON(localStorage.getItem("series"));
      getSeries.generate(seriesData);
    }
    sonarr.getData("series", getSeries.generate);
  },
  generate: function(data){
    if(app.settings.mode !== "series"){
      return; 
    }
    app.cleanList();
    $.each(data, function (index, value) {
      getSeries.add(value);
    });
  },
  add : function (serie) {  
    var template = $('.templates #series');
    template.find('#title').html(serie.title);
    template.find('#status').html(serie.status);
    template.clone().appendTo( ".list" );
  }
}


var getWantedEpisodes = { 
  connect: function(){
    if(localStorage.getItem("wanted") !== 'undefined'){
      var wantedData = $.parseJSON(localStorage.getItem('wanted'));
      getWantedEpisodes.generate(wantedData);
    }
    sonarr.getData("wanted", getWantedEpisodes.generate);
  },
  generate: function(data){
    if(app.settings.mode !== "wanted"){
      return; 
    }
    var totalRecords = data.totalRecords;
    data = data.records;
    app.cleanList();
    $.each(data, function (index, value) {
      getWantedEpisodes.add(value);
    });
    //set num items in button
    $('.menu .wanted .num').html(totalRecords.toString());
    getWantedEpisodes.click();
  },
  add : function(episode){
    var template = $('.templates #wanted');
    var date = { 
      day : episode.airDate.substring(8, 10),
      month : episode.airDate.substring(5, 7)
    } 
    var month = {
      '01': 'jan', 
      '02': 'feb', 
      '03': 'mar', 
      '04': 'apr', 
      '05': 'may', 
      '06': 'jun', 
      '07': 'jul', 
      '08': 'aug', 
      '09': 'sep', 
      '10': 'okt', 
      '11': 'nov', 
      '12': 'dec', 
    }
    template.find('#title').html(episode.series.title);
    template.find('#episodeName').html(episode.title);
    template.find('#episodeNum').html("Search <br/>" + formatEpisodeNumer(episode.seasonNumber,episode.episodeNumber));

    template.attr("data-episodeId", episode.id);

    template.find('#day').html(date.day);
    template.find('#month').html(month[date.month]);
    template.clone().appendTo( ".list" );
  },
  searchEpisode : function (episodeId) {
    if(episodeId < 1){
      return false; 
    }
    var url = app.settings.url + "api/Command?apikey=" + app.settings.apiKey;
    console.log(url);
    $.ajax({
      type: "get",
      url: url,
      data: { 
        name: "episodesearch", 
        episodeIds: episodeId 
      }
    });
  },
  click : function() { 
    $( ".wanted .button" ).click(function() {
      var episodeId = $(this).parentsUntil('.wanted').attr("data-episodeId");
      $(this).parentsUntil('.wanted').animate({'opacity': '0.5'});
      getWantedEpisodes.searchEpisode(episodeId);
    });
  }
}

//set variable from chrome storage option fields
// stored in chrome.storage.
function getOptions() {
  chrome.storage.sync.get({
    apiKey: app.settings.apiKey,
    url: app.settings.url,
    wantedItems : app.settings.wantedItems,
    historyItems: app.settings.historyItems,
  }, function(items){
    app.settings.apiKey = items.apiKey;
    app.settings.url = items.url;
    app.settings.mode = "wanted";
    app.settings.wantedItems = items.wantedItems;
    app.settings.historyItems = items.historyItems;
    app.run();
    console.log('get options from chrome storage');
  });
}

//buttons on menu at the bottom of the extension
var bottomMenu = {
  bind : function(){
    $('.bottom-menu a').unbind( "click" );
    $('#sonarr-url-link').click(bottomMenu.openSonarrUrl);
    $('#options-link').click(bottomMenu.openOptions);
    $('#refresh-link').click(bottomMenu.refreshList);
  },
  openOptions : function() {
    chrome.tabs.create({url: "options.html"});
  },
  openSonarrUrl : function() {
    chrome.tabs.create({url: app.settings.url});
  },
  refreshList : function() {
    app.run();
    background.getItemsInHistory();
  }
}

//buttons on menu at the top of the extension
var menu =  {
  bind : function (){ 
    $('.menu .item').unbind( "click" ).click(function(){
      var mode = $(this).attr('data-mode');
      if(app.settings.mode !== mode){
        //change active item
        $('.menu .item').removeClass('active');
        $(this).addClass('active');
        //change mode
        app.settings.mode = mode;
        console.log(mode);
        //rerun app
        app.run();
      }
    });
  }
}

//save tabs to localstorage for caching
function setLocalStorage () { 
  if (localStorage.getItem('wanted') === null) {
    localStorage.setItem('wanted', undefined);
  }
    if (localStorage.getItem('series') === null) {
    localStorage.setItem('series', undefined);
  }
  if (localStorage.getItem('history') === null) {
    localStorage.setItem('history', undefined);
  }
}

//format episodenumbers to match scene formatting
var formatEpisodeNumer = function(seasonNumber, episodeNumber) { 
  var episodeNum = "S"+ (seasonNumber.toString().length === 1 ? '0' : '') + seasonNumber + "E" + (episodeNumber.toString().length === 1 ? '0' : '') + episodeNumber;
  return episodeNum;
}



var app = {
  settings : {
    apiKey : '',
    url: '',
    mode : 'getOptions', 
    wantedItems: 15,
    historyItems: 15
  },
  run : function(){
    //prepare local storage
    setLocalStorage();

    if(app.settings.mode == 'getOptions' || app.settings.apiKey === '' || app.settings.url === '')
    {
      getOptions();
      return false;
    }
    if (app.settings.mode === "upcoming")
    {
      getupcomingEpisodes.connect(); 
    } 
    else if (app.settings.mode === "wanted") 
    { 
      getWantedEpisodes.connect(); 
    }
	else if (app.settings.mode === "series") 
    { 
      getSeries.connect(); 
    }
    else if (app.settings.mode === "history") 
    { 
      getHistory.connect();
    }
    //bind actions to the menu
    menu.bind();
    //bind bottom menu
    bottomMenu.bind();
  },
  cleanList : function() { 
    //clean list
    $( ".list > div" ).remove(); 
  }
}

//run app when extension is opened
app.run();
