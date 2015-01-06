/*
** Sonnarr Extention
** Shows upcomming and missed episodes.
*/

var sonarr = {
  settings: { 
    wantedCall : "api/wanted/missing?page=1&pageSize=30&sortKey=airDateUtc&sortDir=desc&apikey=", 
    historyCall : "api/history?page=1&pageSize=15&sortKey=date&sortDir=desc&apikey=" 
  },
  getData : function (mode, callback) { 
    var url = "";
    if (mode === "wanted")
    { 
      url = app.settings.url + sonarr.settings.wantedCall + app.settings.apiKey;
      console.log('get wanted data');
    } 
    else if (mode === "history") 
    { 
      url = app.settings.url + sonarr.settings.historyCall + app.settings.apiKey;
      console.log('get history data');
    }
    $.getJSON( url , function( data ) {
      console.log(data);
      if (callback && typeof(callback) == "function") 
      { 
        callback(data); 
      }
    });
  }
}

var getUpcommingEpisodes = {
  connect: function(){

  },
  generate: function(){

  } 
}

var getHistory = {
  connect: function(){
    sonarr.getData("history", getHistory.generate);
    console.log('connecting to sonarr and get latest history');
  },
  generate: function(data){
    data = data.records;
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
    template.find('#episodeName').html(episode.episode.title);
    template.find('#episodeNum').html(episode.episode.seasonNumber + " - "  + episode.episode.episodeNumber);
    
    template.find('#event').html(event[episode.eventType]);
    
    template.attr("data-episodeId", episode.episode.id);
    template.clone().appendTo( ".list" );
  }
}



var getWantedEpisodes = { 
  connect: function(){
    sonarr.getData("wanted", getWantedEpisodes.generate);
  },
  generate: function(data){
    data = data.records;
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
    url: app.settings.url
  }, function(items){
    app.settings.apiKey = items.apiKey;
    app.settings.url = items.url;
    app.settings.mode = "wanted";
    app.run();
    console.log('get options from chrome storage');
    console.log(items);
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

var app = {
  settings : {
    apiKey : '',
    url: '',
    mode : 'getOptions'
  },
  run : function(){ 
    if(app.settings.mode == 'getOptions' || app.settings.apiKey === '' || app.settings.url === '')
    {
      getOptions();
      return false;
    }
    //clean list
    $( ".list > div" ).remove();
    if (app.settings.mode === "upcomming")
    {
      getUpcommingEpisodes.connect(); 
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
  }
}

app.run();