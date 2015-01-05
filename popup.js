/*
** Sonnarr Extention
** Shows upcomming and missed episodes.
*/
var getUpcommingEpisodes = {
  connect: function(){

  },
  generate: function(){

  } 
}

var getMissedEpisodes = { 
  connect: function(){
    var url = app.settings.url + "api/wanted/missing?page=1&pageSize=30&sortKey=airDateUtc&sortDir=desc&apikey=" + app.settings.apiKey;
    console.log(url);
    $.getJSON( url , function( data ) {
      console.log(data);
      getMissedEpisodes.generate(data);
    });
  },
  generate: function(data){
    data = data.records;
    $.each(data, function (index, value) {
      getMissedEpisodes.add(value);
    });
    getMissedEpisodes.click();
  },
  add : function(episode){
    var template = $('.templates #missed');
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
    template.find('#episodeNum').html(episode.seasonNumber + " - "  + episode.episodeNumber);

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
      getMissedEpisodes.searchEpisode(episodeId);
    });
  }
}

var app = {
  settings : {
    apiKey : '',
    url : '',
    mode : 'missing'
  },
  run : function(){ 
    //clean list 
    $( ".list > div" ).remove();
    if (app.settings.mode === "upcomming"){
      getUpcommingEpisodes.connect(); 
    } else { 
      getMissedEpisodes.connect(); 
    }
  }
}


app.run();