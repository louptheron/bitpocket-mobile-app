import { Component } from '@angular/core';
import { NavController, AlertController, MenuController, IonicPage } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core'
import { Config, AccountService, QRScanner, AccountSyncService } from '../../providers/index';
import 'rxjs/add/operator/toPromise';

@IonicPage({
    name : 'account-creation'
})
@Component({
    templateUrl : 'account-creation.html'
})
export class AccountCreationPage {

    accountInput:string = "";
    account:any = null;
    loading:boolean = false;

    constructor(
        private accountSyncService: AccountSyncService ,
        private qrscanner:QRScanner,
        private config: Config,
        private accountService: AccountService,
        private nav:NavController,
        private alertController: AlertController,
        private menuController: MenuController,
        private translate: TranslateService) {
    }

    ionViewWillEnter() {
        this.loading = false;
        this.menuController.enable(false);
    }

    ionViewWillLeave() {
        this.menuController.enable(true);
    }

    parseAccount() {
        let account = this.accountService.parseAccountInput(this.accountInput);
        account.name = "New account";
        return account;
    }

    triggerAlert() {
        Promise.all<string>([
            this.translate.get('TITLE.INVALID_INPUT').toPromise() ,
            this.translate.get('TEXT.INVALID_ACCOUNT_INPUT').toPromise() ,
            this.translate.get('BUTTON.OK').toPromise()
        ]).then((texts) => {
            let alert = this.alertController.create({
                title: texts[0],
                subTitle: texts[1],
                buttons: [texts[2]]
            });
            alert.present();
            this.loading = false;
        });
    }

    start() {
        try {
            this.loading = true;

            if (!this.account) {
                this.account = this.parseAccount();
            }

            let currency = this.accountService.parseAccountInput(this.account.data).currency;
            this.accountService.addAccount(this.account)
                .then(account => {
                    this.account = account;
                    const cryptoInUpperCase = currency.toUpperCase();
                    const configAccountPropertyName = "CONFIG_KEY_DEFAULT_" + cryptoInUpperCase + "_ACCOUNT";

                    return this.config.set(Config[configAccountPropertyName], account._id);
                }).then(() => {
                    return this.accountSyncService.syncAccount(this.account);
                }).then(() => {
                    this.nav.setRoot('amount');
                }).catch(e => {
                    this.triggerAlert();
                    console.error(e);
                });
        } catch (e) {
            this.account = '';
            this.triggerAlert();
        }
    }

    scan() {
        this.qrscanner.scan((text) => {
            this.accountInput = text;
            let account = this.parseAccount();

            if (account) {
                this.account = account;
                return true;
            } else {
                return false;
            }
        });
    }

}
