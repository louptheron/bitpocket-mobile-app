import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Config } from '../../../providers/index';

@IonicPage({
    name : 'general' ,
    defaultHistory : ['settings']
})
@Component({
    templateUrl : 'general.html'
})
export class GeneralPage {

    selectedBitcoinUnit: string = 'mBTC';
    selectedEthereumUnit: string = 'Wei';
    selectedExplorer: string = 'blockchaininfo';
    paymentRequestLabel: string = "";

    constructor(private config: Config) {
    }

    ionViewWillEnter() {
        Promise.all<string>([
            this.config.get(Config.CONFIG_KEY_BITCOIN_UNIT) ,
            this.config.get(Config.CONFIG_KEY_PAYMENT_REQUEST_LABEL) ,
            this.config.get(Config.CONFIG_KEY_ETHEREUM_UNIT) ,
        ]).then(promised => {
            this.selectedBitcoinUnit = promised[0];
            this.paymentRequestLabel = promised[1];
            this.selectedEthereumUnit = promised[2];
        });
    }

    ionViewWillLeave() {
        this.config.set(Config.CONFIG_KEY_BITCOIN_UNIT, this.selectedBitcoinUnit);
        this.config.set(Config.CONFIG_KEY_ETHEREUM_UNIT, this.selectedEthereumUnit);
        this.config.set(Config.CONFIG_KEY_PAYMENT_REQUEST_LABEL, this.paymentRequestLabel);
    }

}
