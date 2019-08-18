import { Component} from '@angular/core';
import { NavParams, NavController, IonicPage } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { PaymentRequestHandler } from './../../api/payment-request-handler';
import { PAYMENT_STATUS_RECEIVED, PAYMENT_STATUS_OVERPAID, PAYMENT_STATUS_PARTIAL_PAID, PaymentRequest } from './../../api/payment-request';
import { PaymentService, AccountService, CryptoUnit, BitcoinUnit, EthereumUnit, Config, CurrencyService, ETHEREUM, BITCOIN } from './../../providers/index';
import * as bip21 from 'bip21';
import EthereumQRPlugin from 'ethereum-qr-code';
import * as qrcode from 'qrcode-generator';
import 'rxjs/add/operator/toPromise';

@IonicPage({
    name : 'payment' ,
    defaultHistory : ['amount']
})
@Component({
    templateUrl : 'payment.html'
})
export class PaymentPage {

    qrImage: any;
    qrImageUnofficial: any;

    amount: CryptoUnit;
    cryptocurrency: string;

    fiatAmount: string = "";
    cryptoAmount: string = "";
    currency: string = "";
    cryptoUnit: string = "";
    currencyRate: number;
    label:string = "";
    currencySeparator:string = ".";
    address: string;
    readableAmount: string;

    paymentRequestHandler:PaymentRequestHandler;
    paymentRequest:PaymentRequest;

    constructor(
        protected paymentService: PaymentService ,
        protected accountService: AccountService,
        protected translation: TranslateService ,
        protected currencyService: CurrencyService ,
        protected config: Config,
        protected navigation:NavController,
        params: NavParams) {
        this.amount = params.data.amount;

        if (this.amount instanceof EthereumUnit) {
            this.cryptocurrency = ETHEREUM;
        } else if(this.amount instanceof BitcoinUnit) {
            this.cryptocurrency = BITCOIN;
        }
    }

    ionViewWillEnter() {
        if(this.cryptocurrency == ETHEREUM) {
            Promise.all<any>([
                this.config.get('currency') ,
                this.translation.get('FORMAT.CURRENCY_S').toPromise() ,
                this.config.get('ethereum-unit') ,
                this.accountService.getDefaultAddress(ETHEREUM) ,
                this.currencyService.getCalculatedEthereumCurrencyRate() ,
                this.config.get('payment-request-label')
            ]).then(promised => {
                this.currency          = promised[0];
                this.currencySeparator = promised[1];
                this.cryptoUnit        = promised[2];
                this.address           = promised[3];
                this.currencyRate      = promised[4];
                this.label             = promised[5];

                this.paymentRequest = {
                    address           : this.address ,
                    amount            : this.amount.to('Wei') ,
                    currency          : 'ETH' ,
                    referenceCurrency : this.currency ,
                    referenceAmount   : this.amount.toFiat(this.currencyRate)
                };

                this.fiatAmount    = this.currencyService.formatNumber(this.amount.toFiat(this.currencyRate, 2), this.currencySeparator);
                this.cryptoAmount = this.currencyService.formatNumber(this.amount.to(this.cryptoUnit), this.currencySeparator, EthereumUnit.decimalsCount(this.cryptoUnit));
                return this.createQrCode();
            }).then(([qrImage, qrImageUnofficial]) => {
                this.qrImage = qrImage;
                this.qrImageUnofficial = qrImageUnofficial;
                this.initPaymentCheck();
            }).catch((e) => {
                this.navigation.setRoot('amount');
                console.error(e);
            });
        } else if(this.cryptocurrency == BITCOIN) {
            Promise.all<any>([
                this.config.get('currency') ,
                this.translation.get('FORMAT.CURRENCY_S').toPromise() ,
                this.config.get('bitcoin-unit') ,
                this.accountService.getDefaultAddress(BITCOIN) ,
                this.currencyService.getCalculatedBitcoinCurrencyRate() ,
                this.config.get('payment-request-label')
            ]).then(promised => {
                this.currency          = promised[0];
                this.currencySeparator = promised[1];
                this.cryptoUnit        = promised[2];
                this.address           = promised[3];
                this.currencyRate      = promised[4];
                this.label             = promised[5];

                this.paymentRequest = {
                    address           : this.address ,
                    amount            : this.amount.to('BTC') ,
                    currency          : 'BTC' ,
                    referenceCurrency : this.currency ,
                    referenceAmount   : this.amount.toFiat(this.currencyRate)
                };

                this.fiatAmount    = this.currencyService.formatNumber(this.amount.toFiat(this.currencyRate, 2), this.currencySeparator);
                this.cryptoAmount = this.currencyService.formatNumber(this.amount.to(this.cryptoUnit), this.currencySeparator, BitcoinUnit.decimalsCount(this.cryptoUnit));
                return this.createQrCode();
            }).then(([qrImage, _]) => {
                this.qrImage = qrImage;
                this.initPaymentCheck();
            }).catch((e) => {
                this.navigation.setRoot('amount');
                console.error(e);
            });
        }
    }

    createQrCode() {
        return new Promise<any> ((resolve, reject) => {
            let qrCodeUri;
            if(this.cryptocurrency == ETHEREUM) {
                qrCodeUri = new EthereumQRPlugin().toAddressString({
                    to: this.address,
                    value: this.amount.to('Wei').toFixed(15),
                    gas: 21000,
                })
            } else if(this.cryptocurrency == BITCOIN) {
                qrCodeUri = bip21.encode(this.address, {
                    amount : this.amount.to('BTC') ,
                    label  : this.label
                });
            }

            let qrOfficial:any = qrcode(0,'M');
            qrOfficial.addData("ethereum:0x0ac10bf0342fa2724e93d250751186ba5b659303?amount=0.028606927918958&gas=21000");
            qrOfficial.make();

            let qrUnofficial:any = null;
            if(this.cryptocurrency == ETHEREUM) {
              qrUnofficial = qrcode(0,'M');
              qrUnofficial.addData("ethereum:"+ this.address +"?amount="+ this.amount.to('ETH').toFixed(15) +"&gas=21000");
              qrUnofficial.make();
            }

            resolve([qrOfficial.createImgTag(5,5), qrUnofficial ? qrUnofficial.createImgTag(5,5) : null]);
        });
    }

    initPaymentCheck() {
        this.paymentRequestHandler = this.paymentService.createPaymentRequestHandler(this.paymentRequest);
        this.paymentRequestHandler
            .once('payment-status:' + PAYMENT_STATUS_RECEIVED, (result) => {
                this.paymentRequest.txid = result.txid;
                this.paymentRequest.txAmount = result.amount;
                this.paymentRequest.currency = result.currency;
                this.paymentRequest.status = PAYMENT_STATUS_RECEIVED;
                this.paymentReceived();
            }).once('payment-status:' + PAYMENT_STATUS_OVERPAID, (result) => {
                this.paymentRequest.txid = result.txid;
                this.paymentRequest.txAmount = result.amount;
                this.paymentRequest.currency = result.currency;
                this.paymentRequest.status = PAYMENT_STATUS_OVERPAID;
                this.paymentReceived();
            }).once('payment-status:' + PAYMENT_STATUS_PARTIAL_PAID, (result) => {
                this.paymentRequest.txid = result.txid;
                this.paymentRequest.txAmount = result.amount;
                this.paymentRequest.currency = result.currency;
                this.paymentRequest.status = PAYMENT_STATUS_PARTIAL_PAID;
                this.paymentReceived();
            });
    }

    paymentReceived() {
        let audio = new Audio('assets/sound/paid.mp3');
        audio.play();

        this.navigation.setRoot('payment-result', {
            paymentRequest: this.paymentRequest
        });
    }

    ionViewWillLeave() {
        this.paymentRequestHandler.cancel();
    }

}
