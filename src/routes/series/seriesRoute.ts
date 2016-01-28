import {Component, View} from 'angular2/core';
import {SonarrService} from "../../services/sonarrService";
import {StorageService} from "../../services/storageService";
import {SeriesList} from "../../components/seriesList/seriesList";

@Component({
  selector: 'home-route'
})
@View({
  templateUrl: 'seriesRoute.tpl.html',
  directives: [SeriesList]
})
export class SeriesRoute {
  private domoticzSerivice:SonarrService;
  public series:any = [];

  constructor(domserv:SonarrService, private storage:StorageService) {
    this.domoticzSerivice = domserv;
    this.series = storage.getSeries();

    this.getSeries();
  }

  getSeries(){
    var _this = this;
    this.domoticzSerivice.getAllSeries().subscribe(function(resp){
      resp = resp.json();
      _this.series = resp;
      _this.storage.setSeries(resp);
    });
  }

}