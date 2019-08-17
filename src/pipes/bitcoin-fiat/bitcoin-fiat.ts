import { BitcoinUnit, EthereumUnit } from './../../providers/index';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'bitcoinFiat'
})
export class BitcoinFiatPipe implements PipeTransform {
    transform(value:any, from="BTC", rate:number=0) : number {
        return  BitcoinUnit.from(parseFloat(value), from).toFiat(rate);
    }
}
