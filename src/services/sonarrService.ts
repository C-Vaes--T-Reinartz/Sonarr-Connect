import {Http, Headers, Jsonp} from "angular2/http";
import {Component, Inject} from "angular2/core";
import {Response} from "angular2/http";
import {Observable} from "rxjs/Observable";


export class SonarrService {
    private apikey:string = '';
    private url:string = '';
    private http:Http;

    constructor (@Inject(Http) http:Http) {
        console.log('starting service');
        this.http = http;
        this.getSettingsFromLocalStorage();
    }

    getSettingsFromLocalStorage () {
        var settings = JSON.parse( localStorage.getItem('settings') );
        if(settings !== null) {
            //this.apikey = settings.apikey;
            //this.url = settings.url;
        }
    }

    setUrlAndApiKey (url:string, apikey:string) {
        //this.url = url;
        //this.apikey = apikey;
    }

    //wanted : "api/wanted/missing?page=1&pageSize={wantedItems}&sortKey=airDateUtc&sortDir=desc&apikey={apikey}",
    //calendar : "api/calendar?page=1&sortKey=airDateUtc&sortDir=desc&start={calendarStartDate}&end={calendarEndDate}&apikey={apikey}",
    //series : "api/series?page=1&sortKey=title&sortDir=desc&apikey={apikey}",
    //episode : "api/episode/\{episodeId}?apikey={apikey}",
    //episodes : "api/episode?seriesId={seriesId}&apikey={apikey}",
    //history : "api/history?page=1&pageSize={historyItems}&sortKey=date&sortDir=desc&apikey={apikey}",
    //manualDownload : "/api/release?episodeId={episodeId}&sort_by=releaseWeight&order=asc&apikey={apikey}"

    getWantedEpisodes () {
        return this.http.get(this.url + 'api/wanted/missing?page=1&pageSize=30&sortKey=airDateUtc&sortDir=desc&apikey=' + this.apikey );
    }

    getCalendar () {
        return this.http.get(this.url + 'api/calendar?apikey=' + this.apikey );
    }

    getAllSeries(){
        return this.http.get(this.url + 'api/series?apikey=' + this.apikey );
    }

    getSeriesById(id:number){
        return this.http.get(this.url + 'api/series/?apikey=' + this.apikey );
    }

    getEpisodeById(episodeId:number){
        return this.http.get(this.url + 'api/episode/' + episodeId + '?apikey=' + this.apikey );
    }
    getEpisodesBySeriesId(seriesId:number){
        return this.http.get(this.url + 'api/episode?seriesId=' + seriesId + '&apikey=' + this.apikey );
    }

    getHistory(){
        return this.http.get(this.url + 'api/history?apikey=' + this.apikey );
    }

    manualDownloadEpisode(episodeId:number){
        return this.http.get(this.url + 'api/release?episodeId='+ episodeId +'&apikey=' + this.apikey );
    }

    getVersion():any {

    }

}