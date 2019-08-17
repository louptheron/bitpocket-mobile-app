import { BitcoinUnit, EthereumUnit } from './../../providers/index';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'ethereumFiat'
})
export class EthereumFiatPipe implements PipeTransform {
    transform(value:any, from="Wei", rate:number=0) : number {
        console.log(value, from, rate);
        return  EthereumUnit.from(parseFloat(value), from).toFiat(rate);
    }
}
