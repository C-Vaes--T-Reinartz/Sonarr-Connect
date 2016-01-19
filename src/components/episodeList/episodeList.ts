import {Component, View, Input} from 'angular2/core';
import {OnChanges} from "angular2/core";
import {DeviceNameToMDIcon} from "../../filters/deviceNameToMDIcon";
import {SonarrService} from "../../services/sonarrService";

@Component({
  selector: 'episode-list'
})
@View({
  templateUrl: 'episodeList.html',
  pipes: [DeviceNameToMDIcon]
})
export class EpisodeList implements OnChanges {
  @Input() list:any[];
  public episodes:any[];

  constructor (private domoticzService:SonarrService) {
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
  }

  setWatchedIndicator (state:boolean, episode:any){
    //handle event
  }


}

