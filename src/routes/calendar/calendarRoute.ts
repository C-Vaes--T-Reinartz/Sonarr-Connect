import {Component, View} from 'angular2/core';
import {SonarrService} from "../../services/sonarrService";
import {EpisodeList} from "../../components/episodeList/episodeList";

@Component({
  selector: 'home-route'
})
@View({
  templateUrl: 'calendarRoute.tpl.html',
  directives: [EpisodeList]
})
export class DevicesRoute {
  private domoticzSerivice:SonarrService;
  public plans:any = [];
  public devices:any = [];

  constructor(domserv:SonarrService) {
    this.domoticzSerivice = domserv;
  }

}