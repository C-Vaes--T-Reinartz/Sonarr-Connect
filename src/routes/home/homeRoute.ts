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
    private calendarEpisodes:Array<Episode> = [];
    private storage:StorageService;

    constructor(sonarrService:SonarrService) {
        this.sonarrService = sonarrService;
        this.storage = new StorageService();
        //get data from local storage
        this.wantedEpisodes = this.storage.getWanted();
        this.calendarEpisodes = this.storage.getCalendar();

        //get data from api
        this.getWantedEpisodes();
        this.getCalendarEpisodes();
    }

    getWantedEpisodes () {
        var _this = this;
        //get local stored episodes
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

                //update local stored episodes
                _this.storage.setWanted(_this.wantedEpisodes);
            }
        )
    }
    getCalendarEpisodes () {
        var _this = this;
        this.sonarrService.getCalendar().subscribe(
            function(resp){
                var data = resp.json();
                _this.calendarEpisodes = [];
                //process data
                data.forEach(function(episode:Episode){
                    //mapping happens here
                    _this.calendarEpisodes.push(episode)
                });

                //update local storage
                _this.storage.setCalendar(_this.calendarEpisodes);
            }
        )
    }
}