import {Component, View, Input} from 'angular2/core';
import {OnChanges} from "angular2/core";
import {DeviceNameToMDIcon} from "../../filters/deviceNameToMDIcon";
import {SonarrService} from "../../services/sonarrService";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
  selector: 'episode-list',
})
@View({
  templateUrl: 'episodeList.html',
  directives: [ROUTER_DIRECTIVES],
  pipes: [DeviceNameToMDIcon]
})
export class EpisodeListShow implements OnChanges {
  @Input() list:any[];
  public episodes:any[];

  constructor (private domoticzService:SonarrService, private sonarrService:SonarrService) {
    this.episodes = [];

    console.log('list is ready');
  }

  //update list via input
  ngOnChanges(changes:{}):any {
    if(typeof this.list == 'object')
      this.setEpisodeList(this.list);
  }

  private setEpisodeList (episodes) {
    var list:any[] = [];
    episodes.forEach(function(episode:any){
      //manipulate episode model

      list.push(episode);
    });
    this.episodes = list;
    console.log(list);
  }

  setWatchedIndicator (state:boolean, episode:any){
    //handle event
  }
  getPoster(images){
    return this.sonarrService.getPoster(images);
  }
  getDate(date){
    return new Date(date);
  }

  formatEpisodeNumer(seasonNumber, episodeNumber) {
    var episodeNum = "S" + (seasonNumber.toString().length === 1 ? '0' : '') + seasonNumber + "E" + (episodeNumber.toString().length === 1 ? '0' : '') + episodeNumber;
    return episodeNum;
  }


}

