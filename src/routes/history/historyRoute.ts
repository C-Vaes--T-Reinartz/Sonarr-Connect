import {Component, View} from 'angular2/core';
import {SonarrService} from "../../services/sonarrService";
import {StorageService} from "../../services/storageService";
import {HistoryList} from "../../components/historyList/historyList";

@Component({
  selector: 'home-route'
})
@View({
  templateUrl: 'historyRoute.tpl.html',
  directives: [HistoryList]
})
export class HistoryRoute {
  private domoticzSerivice:SonarrService;
  public history:any = [];

  constructor(domserv:SonarrService, private storage:StorageService) {
    this.domoticzSerivice = domserv;
    this.history = storage.getHistory();
    this.getHistory();
  }

  getHistory(){
    var _this = this;
    this.domoticzSerivice.getHistory().subscribe(function(resp){
      resp = resp.json();
      _this.storage.setHistory(resp.records);
    })
  }

}