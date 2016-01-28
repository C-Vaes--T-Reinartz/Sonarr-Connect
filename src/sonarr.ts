import {Component, View, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from "angular2/http";
import {Http} from "angular2/http";
import {RouteConfig, ROUTER_PROVIDERS, ROUTER_DIRECTIVES, LocationStrategy, HashLocationStrategy, Router} from "angular2/router";
import {HomeRoute} from "./routes/home/homeRoute";
import {SettingsRoute} from "./routes/settings/settingsRoute";
import {DevicesRoute} from "./routes/calendar/calendarRoute";
import {SonarrService} from "./services/sonarrService"
import {StorageService} from "./services/storageService";
import {SeriesRoute} from "./routes/series/seriesRoute";
import {HistoryRoute} from "./routes/history/historyRoute";
import {ShowRoute} from "./routes/show/showRoute";

@Component({
    selector: 'sonarr-connect',
    providers: [StorageService]
})

@View({
    directives: [ROUTER_DIRECTIVES],
    templateUrl: 'sonarr.html'
})

@RouteConfig([
    {path: '/', name: 'Calendar', component: HomeRoute},
    {path: '/series', name: 'Shows', component: SeriesRoute},
    {path: '/series/:name', name: 'Show', component: ShowRoute},
    {path: '/history', name: 'History', component: HistoryRoute},
    {path: '/settings', name: 'Settings', component: SettingsRoute},
])

class Sonarr {
    offCanvasLeftOpen:boolean = false;

    constructor(router:Router) {
        console.log('app loading');
        var storage = new StorageService();
        if(storage.getSettings().url == undefined){
            window.setTimeout(function(){
                console.log('no settings found, go to settings route');
                router.navigate(['/Settings', {}])
            }, 100);
        }
    }

    toggleoffCanvasLeft() {
        this.offCanvasLeftOpen = !this.offCanvasLeftOpen;
    }
}

bootstrap(Sonarr, [
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS,
    SonarrService,
    provide(LocationStrategy, {useClass: HashLocationStrategy})
]);
