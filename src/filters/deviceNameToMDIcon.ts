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
@Pipe({name: 'deviceNameToMDIcon'})
export class DeviceNameToMDIcon {
    private mapping:any = {
        Default: 'adjust',
        Light: 'lightbulb_outline',
        TV: 'tv',
        Computer: 'computer',
        Phone: 'smartphone',
        Scene: 'group_work',
        Temp: 'ac_unit',
    };

    transform(value:number, args:string[]) : any {
        var icon = this.mapping[value];
        if(typeof icon == 'undefined')
            icon = this.mapping.Default;
        return icon;
    }
}
