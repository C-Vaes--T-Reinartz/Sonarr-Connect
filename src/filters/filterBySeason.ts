import {Pipe} from 'angular2/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
 */
@Pipe({name: 'filterBySeason'})
export class FilterBySeason {
    transform(episodes:Array<any>, args:string[]) : any {
        var season = args[0];
        var list = [];
        episodes.forEach(function(episode){
            if(episode.seasonNumber == season)
                list.push(episode);
        });
        return list;
    }
}
