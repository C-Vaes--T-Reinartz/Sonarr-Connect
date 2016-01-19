import {Component, View} from 'angular2/core';
import {SonarrService} from "../../services/sonarrService";

@Component({
  selector: 'settings-route'
})
@View({
  templateUrl: 'settingsRoute.tpl.html'
})
export class SettingsRoute{
  url: string;
  apikey: string;
  model:any;
  status:any = {};

  constructor (private sonarrService:SonarrService) {
    this.model = {
      url: null,
      apikey: null,
    };

    if(this.getSettings() !== null)
      this.model = this.getSettings();
  }

  getSettings() {
    return JSON.parse( localStorage.getItem('settings') );
  }

  storeSettings() {
    console.log(this.model);
    this.status.update = 'Checking connection....';
    var _this = this;
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