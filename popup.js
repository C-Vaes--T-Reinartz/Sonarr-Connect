/*
** Sonnarr Extention
** Shows upcoming and missed episodes.
*/

var sonarr = {
  settings: { 
    wanted : "api/wanted/missing?page=1&pageSize={historyItems}&sortKey=airDateUtc&sortDir=desc&apikey={apikey}", 
    history : "api/history?page=1&pageSize={historyItems}&sortKey=date&sortDir=desc&apikey={apikey}" 
  },
  getData : function (mode, callback) { 
    var url = "";
    url = app.settings.url + sonarr.settings[mode];
    
    url = url.replace("{historyItems}", app.settings.historyItems);
    url = url.replace("{apikey}", app.settings.apiKey);

    $.getJSON( url , function( data ) {
      if (callback && typeof(callback) === "function") 
      { 
        callback(data);
        //store data
        if(mode === "wanted"){ 
          localStorage.setItem("wanted", JSON.stringify(data));
        }        
        if(mode === "history"){ 
          localStorage.setItem("history", JSON.stringify(data));
        }
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
    if(localStorage.getItem("history") !== 'undefined'){
      var historyData = $.parseJSON(localStorage.getItem("history"));
      getHistory.generate(historyData);
    }
    sonarr.getData("history", getHistory.generate);
  },
  generate: function(data){
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
    template.find('#title').html(episode.series.title);
    template.find('#episodeNum').html(episode.episode.seasonNumber + " - "  + episode.episode.episodeNumber);

    template.find('#event').html(event[episode.eventType]);

    template.attr("data-episodeId", episode.episode.id);
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
    data = data.records;
    app.cleanList();
    $.each(data, function (index, value) {
      getWantedEpisodes.add(value);
    });
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
    template.find('#episodeNum').html("download <br/>" + "S" + episode.seasonNumber + " E"  + episode.episodeNumber );

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
    $( ".missed" ).click(function() {
      console.log(this);
      var episodeId = $(this).attr("data-episodeId");
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
    historyItems: app.settings.historyItems,
  }, function(items){
    app.settings.apiKey = items.apiKey;
    app.settings.url = items.url;
    app.settings.mode = "wanted";
    app.settings.historyItems = items.historyItems;
    app.run();
    console.log('get options from chrome storage');
  });
}

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

function setLocalStorage () { 
  if (localStorage.getItem('wanted') === null) {
    localStorage.setItem('wanted', undefined);
  }
  if (localStorage.getItem('history') === null) {
    localStorage.setItem('history', undefined);
  }
}

var app = {
  settings : {
    apiKey : '',
    url: '',
    mode : 'getOptions', 
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
    else if (app.settings.mode === "history") 
    { 
      getHistory.connect();
    }
    //bind actions to the menu
    menu.bind();
  },
  cleanList : function() { 
    //clean list
    $( ".list > div" ).remove(); 
  }
}
app.run();