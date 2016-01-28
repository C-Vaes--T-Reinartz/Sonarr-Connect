import {Episode} from "../models";
/**
 * Created by Tom on 19-1-2016.
 */
export class StorageService {
    constructor(){
        //prep local storage
        console.log(this.getSettings());
        if(this.getSettings() == null)
            this.setSettings({});

        if(this.getCalendar() == null)
            this.setCalendar([]);

        if(this.getHistory() == null)
            this.setHistory([]);

        if(this.getWanted() == null)
            this.setWanted([]);

        if(this.getSeries() == null)
            this.setSeries([]);

    }

    public getSettings():any{
        return JSON.parse( localStorage.getItem('settings') );
    }

    public setSettings(settings:any){
        localStorage.setItem('settings', JSON.stringify(settings) );
    }

    public getCalendar():Array<Episode>{
        return JSON.parse( localStorage.getItem('calendar') );
    }

    public setCalendar(calendar:any){
        localStorage.setItem('calendar', JSON.stringify(calendar) );
    }

    public getWanted():Array<Episode>{
        return JSON.parse( localStorage.getItem('wanted') );
    }

    public setWanted(wanted:any){
        localStorage.setItem('wanted', JSON.stringify(wanted) );
    }

    public getHistory():Array<Episode>{
        return JSON.parse( localStorage.getItem('history') );
    }

    public setHistory(history:any){
        localStorage.setItem('history', JSON.stringify(history) );
    }

    public getSeries():Array<any> {
        return JSON.parse( localStorage.getItem('series') );
    }

    public setSeries(series):void {
        localStorage.setItem('series', JSON.stringify(series) );

    }
}