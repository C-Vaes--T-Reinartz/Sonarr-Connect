///<reference path="../../services/sonarrService.ts"/>
import {Component, View} from 'angular2/core';
import {NgForm}    from 'angular2/common';
import {SonarrService} from "../../services/sonarrService";
import {StorageService} from "../../services/storageService";

@Component({
  selector: 'settings-route'
})

@View({
  templateUrl: 'settingsRoute.tpl.html'
})

export class SettingsRoute {
  public url: string = '';
  public apikey: string = '';
  public model:any = {  url: '', apikey: '', name: '' };
  public status:any = '';

  constructor (private sonarrService:SonarrService, private storage:StorageService) {
    if(storage.getSettings().url != undefined)
      this.model = storage.getSettings();

    console.log(this.model);
  }

  checkSettings (url:string, apiKey:string) {
    return (url.length > 3 && apiKey.length > 10);
  }

  storeSettings() {
    console.log(this.model);
    this.status.update = 'Checking connection....';
    var _this = this;

    //check input
    if(!this.checkSettings(this.model.url, this.model.apikey)){
      return this.status = 'url or apikey are invalid';
    }

    //update username and password
    this.sonarrService.setUrlAndApiKey(this.model.url, this.model.apikey);

    //test connection
    this.sonarrService.getVersion().subscribe(function(response){
      //if connection is good then store settings
      if(response.json().Status = "OK") {
        _this.status = response;
        _this.status.update = 'Connected to Sonarr version: ' + response.json().version;
        localStorage.setItem('settings', JSON.stringify(_this.model));
      }
    }, function(error){
      _this.status.update = 'Could not connect, please check url and apikey';
    });
  }
}