import {Component, View, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from "angular2/http";
import {Http} from "angular2/http";
import {RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy} from "angular2/router";
import {HomeRoute} from "./routes/home/homeRoute";
import {SettingsRoute} from "./routes/settings/settingsRoute";
import {DevicesRoute} from "./routes/calendar/calendarRoute";
import {SonarrService} from "./services/sonarrService"
import {StorageService} from "./services/storageService";

@Component({
    selector: 'sonarr-connect'
})

@View({
    directives: [ROUTER_DIRECTIVES],
    templateUrl: 'sonarr.html'
})

@RouteConfig([
    {path: '/', name: 'Calendar', component: HomeRoute, useAsDefault: true},
    {path: '/series', name: 'Shows', component: DevicesRoute},
    {path: '/series/show', name: 'Show', component: DevicesRoute},
    {path: '/history', name: 'History', component: DevicesRoute},
    {path: '/settings', name: 'Settings', component: SettingsRoute},
])

class Domoticz {
    offCanvasLeftOpen:boolean = false;

    constructor() {
        console.log('app loading');
        var storage = new StorageService();
    }

    toggleoffCanvasLeft() {
        this.offCanvasLeftOpen = !this.offCanvasLeftOpen;
    }
}

bootstrap(Domoticz, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    SonarrService,
    provide(LocationStrategy, {useClass: HashLocationStrategy})
]);
