import {Component} from '@angular/core';
import {NavParams, NavController, LoadingController, Platform, Loading, IonicPage} from 'ionic-angular';
import {Config, CurrencyService, BitcoinUnit, EthereumUnit, BITCOIN, ETHEREUM} from '../../providers/index';
import {TranslateService} from '@ngx-translate/core';
import 'rxjs/add/operator/toPromise';

@IonicPage({
    name : 'select-crypto'
})
@Component({
    templateUrl : 'select-crypto.html'
})
export class SelectCryptoPage {

    cryptocurrencies: string[] = [BITCOIN, ETHEREUM]
    amount: any;
    loader: Loading;
    exchangedAmount:string; // either BTC or Fiat
    digits:string   = "0";
    decimals:string = "00";
    separator:string = ".";

    position:string; // digits or decimals area
    index:number; // index of writing position
    entryInFiat:boolean = true;
    entryInBTC:boolean = false;

    currency:string;
    bitcoinUnit:string;

    constructor(
        private translation: TranslateService,
        private platform: Platform,
        private currencyService: CurrencyService,
        protected config: Config,
        protected navigation:NavController,
        params: NavParams) {
        this.amount = params.data.amount;
    }

    ionViewWillEnter() {}

    requestPayment(cryptocurrencyIndex: number) {
        if(this.cryptocurrencies[cryptocurrencyIndex] == BITCOIN) {
            this.currencyService.getCalculatedBitcoinCurrencyRate().then(rate => {
                this.navigation.push('payment', {
                    amount: BitcoinUnit.fromFiat(this.amount,rate) ,
                });
            });
        } else if(this.cryptocurrencies[cryptocurrencyIndex] == ETHEREUM) {
            this.currencyService.getCalculatedEthereumCurrencyRate().then(rate => {
                this.navigation.push('payment', {
                    amount: EthereumUnit.fromFiat(this.amount,rate) ,
                });
            });
        }
    }

}
