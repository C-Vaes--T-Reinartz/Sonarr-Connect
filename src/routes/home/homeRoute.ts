import {Component, View} from 'angular2/core';
import {SonarrService} from "../../services/sonarrService";
import {EpisodeList} from "../../components/episodeList/episodeList";
import {Episode} from "../../models";
import {StorageService} from "../../services/storageService";

@Component({
    selector: 'home-route'
})

@View({
    templateUrl: 'homeRoute.tpl.html',
    directives: [EpisodeList]
})

export class HomeRoute {
    private sonarrService:SonarrService;
    private wantedEpisodes:Array<Episode> = [];
    private calendarEpisodesToday:Array<Episode> = [];
    private calendarEpisodesTomorrow:Array<Episode> = [];
    private calendarEpisodesLater:Array<Episode> = [];
    private storage:StorageService;

    constructor(sonarrService:SonarrService) {
        this.sonarrService = sonarrService;
        this.storage = new StorageService();
        //get data from local storage
        this.wantedEpisodes = this.storage.getWanted();
        this.setCalendar( this.storage.getCalendar() );

        if(this.storage.getSettings().url != undefined) {
            //get data from api
            this.getWantedEpisodes();
            this.getCalendarEpisodes();
        }
    }

    getWantedEpisodes () {
        var _this = this;
        //get local stored series
        this.sonarrService.getWantedEpisodes().subscribe(
            function(resp){
                var data = resp.json();
                //clear data
                _this.wantedEpisodes = [];
                //process data
                data.records.forEach(function(episode:Episode){
                    //mapping happens here
                    _this.wantedEpisodes.push(episode);
                });

                //update local stored series
                _this.storage.setWanted(_this.wantedEpisodes);
            }
        )
    }
    getCalendarEpisodes () {
        var _this = this;
        this.sonarrService.getCalendar().subscribe(
            function(resp){
                var data = resp.json();
                var calendarEpisodes = [];
                //process data
                data.forEach(function(episode:Episode){
                    //mapping happens here
                    calendarEpisodes.push(episode)
                });

                //update local storage
                _this.storage.setCalendar(calendarEpisodes);
                _this.setCalendar(calendarEpisodes);
            }
        )
    }

    setCalendar(calendarEpisodes:Array<any>){
        this.calendarEpisodesToday = [];
        this.calendarEpisodesTomorrow = [];
        this.calendarEpisodesLater = [];
        var _this = this;
        var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        tomorrow.setHours(0, 0, 0, 0);
        var dayAfterTomorrow = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
        dayAfterTomorrow.setHours(0, 0, 0, 0);

        calendarEpisodes.forEach(function(episode){
            if (new Date(episode.airDateUtc).valueOf() >= new Date().setHours(0, 0, 0, 0).valueOf() && new Date(episode.airDateUtc).valueOf() <= tomorrow.valueOf()) {
                _this.calendarEpisodesToday.push(episode);
                // tomorrow
            } else if (new Date(episode.airDateUtc).valueOf() >= tomorrow.valueOf() && new Date(episode.airDateUtc).valueOf() <= dayAfterTomorrow.valueOf()) {
                _this.calendarEpisodesTomorrow.push(episode);
                //later
            } else {
                _this.calendarEpisodesLater.push(episode);
            }

        });
    }
}