import {Component, View, Input} from 'angular2/core';
import {OnChanges} from "angular2/core";
import {DeviceNameToMDIcon} from "../../filters/deviceNameToMDIcon";
import {ROUTER_DIRECTIVES} from "angular2/router";

import {StorageService} from "../../services/storageService";
import {SonarrService} from "../../services/sonarrService";

@Component({
  selector: 'series-list'
})
@View({
  templateUrl: 'seriesList.html',
  directives: [ROUTER_DIRECTIVES],
  pipes: [DeviceNameToMDIcon]
})
export class SeriesList implements OnChanges {
  @Input() list:any[];
  public series:any[];

  constructor (private storage:StorageService, private api:SonarrService) {
    this.series = [];
    console.log('list is ready');
  }

  //update list via input
  ngOnChanges(changes:{}):any {
    if(typeof this.list == 'object')
      this.setSeriesList(this.list);
  }

  private setSeriesList (series) {
    var list:any[] = [];
    console.log(series);
    series.forEach(function(serie:any){
      //manipulate episode model

      list.push(serie);
    });
    this.series = list;
  }

  getPoster(images){
    return this.api.getPoster(images);
  }


}

