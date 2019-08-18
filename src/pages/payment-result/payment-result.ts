import { Component } from '@angular/core';
import { NavParams, NavController, IonicPage } from 'ionic-angular';
import { CryptocurrencyService, CurrencyService, Config, AccountService, BitcoinUnit, EthereumUnit, AccountSyncService, ETHEREUM, BITCOIN } from '../../providers/index';
import { TranslateService } from '@ngx-translate/core';
import { PaymentRequest, PAYMENT_STATUS_RECEIVED, PAYMENT_STATUS_OVERPAID, PAYMENT_STATUS_PARTIAL_PAID } from './../../api/payment-request';
import { Account } from './../../api/account';
import 'rxjs/add/operator/toPromise';

@IonicPage({
    name : 'payment-result' ,
    defaultHistory : ['amount']
})
@Component({
    templateUrl : 'payment-result.html'
})
export class PaymentResultPage {

    resultSuccess : boolean = false;
    resultIcon : string = "";
    resultText : string = "";
    paymentRequest:PaymentRequest;
    account:Account = null;

    currency:string = "";
    amount:string = "";
    referenceCurrency = "";
    referenceAmount = "";

    waiting:boolean = true;

    getResultClasses() {
        if (this.resultSuccess) {
            return { "transaction-success" : true , "transaction-failed" : false };
        } else {
            return { "transaction-success" : false , "transaction-failed" : true };
        }
    }

    ionViewWillLeave() {
        this.waiting = false;
    }

    ionViewWillEnter() {
        this.paymentRequest = this.params.data.paymentRequest;

        if (this.paymentRequest.status == PAYMENT_STATUS_RECEIVED) {
            this.resultSuccess = true;
            this.resultIcon = "checkmark-circle";
        } else if (this.paymentRequest.status == PAYMENT_STATUS_OVERPAID ||
                   this.paymentRequest.status == PAYMENT_STATUS_PARTIAL_PAID) {
            // change referenceAmount in accordance
            this.paymentRequest.referenceAmount = this.paymentRequest.referenceAmount * (this.paymentRequest.txAmount / this.paymentRequest.amount);
            this.resultSuccess = true;
            this.resultIcon = "alert";
        } else {
            this.resultIcon = "close-circle";
        }

        const cryptoInUpperCase = this.paymentRequest.currency.toUpperCase();

        Promise.all<any>([
            this.config.get(Config["CONFIG_KEY_" + cryptoInUpperCase + "_UNIT"]) ,
            this.translate.get('FORMAT.CURRENCY_S').toPromise() ,
            this.translate.get('PAYMENT_STATUS.' + this.paymentRequest.status).toPromise() ,
            this.accountService.getDefaultAccount(this.paymentRequest.currency)
        ]).then(promised => {
            this.account = promised[3];
            this.currency = promised[0];
            this.referenceCurrency = this.paymentRequest.referenceCurrency;
            if(this.paymentRequest.currency == BITCOIN) {
                this.amount = this.currencyService.formatNumber(BitcoinUnit.from(this.paymentRequest.txAmount,'BTC').to(this.currency), promised[1], BitcoinUnit.decimalsCount(this.currency));
            } else if(this.paymentRequest.currency == ETHEREUM) {
                this.amount = this.currencyService.formatNumber(EthereumUnit.from(this.paymentRequest.txAmount,'Wei').to(this.currency), promised[1], EthereumUnit.decimalsCount(this.currency));
            }
            this.referenceAmount = this.currencyService.formatNumber(this.paymentRequest.referenceAmount, promised[1]);
            this.resultText = promised[2];

            if (this.resultSuccess) {
                console.log(this.paymentRequest)
                this.accountSyncService.storeTransaction({
                    _id       : this.paymentRequest.txid ,
                    amount    : this.paymentRequest.txAmount ,
                    currency  : this.cryptocurrencyService.parseInput(this.account.data).currency ,
                    address   : this.paymentRequest.address ,
                    incomming : true ,
                    confirmations : 0 ,
                    paymentReferenceAmount : this.paymentRequest.referenceAmount ,
                    paymentReferenceCurrency : this.paymentRequest.referenceCurrency ,
                    paymentStatus : this.paymentRequest.status
                }, this.account._id).then(() => {
                    // TODO: is a sync required at this moment?
                    // index needs to be updated
                    this.accountSyncService.syncAccount(this.account);
                });
            }
        });
    }

    showHistory() {
        this.nav.setRoot('history', { accountId : this.account._id });
    }

    constructor(
        protected cryptocurrencyService: CryptocurrencyService ,
        protected accountSyncService: AccountSyncService,
        protected accountService: AccountService,
        protected translate: TranslateService,
        protected currencyService: CurrencyService,
        protected config: Config,
        protected params: NavParams,
        protected nav: NavController) {}

}
