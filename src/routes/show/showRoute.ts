import {Component, View} from 'angular2/core';
import {SonarrService} from "../../services/sonarrService";
import {StorageService} from "../../services/storageService";
import {RouteParams} from 'angular2/router';
import {EpisodeListShow} from "../../components/episodeListShow/episodeListShow";
import ArrayContaining = jasmine.ArrayContaining;
import {FilterBySeason} from "../../filters/filterBySeason";

@Component({
  selector: 'show-route'
})
@View({
  templateUrl: 'showRoute.tpl.html',
  directives: [EpisodeListShow],
  pipes: [FilterBySeason]
})
export class ShowRoute {
  private domoticzSerivice:SonarrService;
  public series:any = [];
  public show:any = {};
  public episodes:any = [];
  public seasonNumber:number = 1;
  public seasons:Array<any> = ['loading'];
  constructor(private sonarService:SonarrService, private storage:StorageService, params: RouteParams) {
    this.series = storage.getSeries();
    this.show.seasons = [];
    this.setShow(params.get('name'));

  }
  setShow(showSlug){
    var _this = this;
    this.series.forEach(function(show){
      if(show.titleSlug == showSlug) {
        console.log(show);
        _this.show = show;
        _this.getShowEpisodes(show);
      }
    })
  }

  getShowEpisodes(show){
    var _this = this;
    this.sonarService.getEpisodesBySeriesId(show.id).subscribe(function(resp){
      _this.episodes = resp.json();
      _this.setSeasons(resp.json());
    })
  }

  setSeasons(episodes:Array<any>){
    var _this = this;
    _this.seasons = [];
    episodes.forEach(function(episode){
      if(_this.seasons.indexOf(episode.seasonNumber) == -1)
        _this.seasons.push(episode.seasonNumber);
    });
  }

  filterBySeason(){
    var list = [];
    var _this = this;
    this.episodes.forEach(function(episode){
      if(episode.seasonNumber == _this.seasonNumber)
        list.push(episode);
    });
    return list;
  }
}