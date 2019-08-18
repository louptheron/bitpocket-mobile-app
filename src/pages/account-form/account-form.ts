import { Component } from '@angular/core';
import { NavParams, NavController, AlertController, ModalController, Modal, IonicPage, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core'
import { Account } from './../../api/account';
import { Config, AccountService, AccountSyncService, QRScanner } from './../../providers/index';
import 'rxjs/add/operator/toPromise';

@IonicPage({
    name : 'account-form' ,
    defaultHistory: ['account']
})
@Component({
    templateUrl : 'account-form.html'
})
export class AccountFormPage {

    account:Account = {
        name : '' ,
        type : 'ACCOUNT_TYPE' ,
        data : ''
    };

    removed = false;
    accountEnabled = true;
    accountDefault = false;
    canChangeDefaultAccount = false;
    loader:any;

    constructor(
        protected modalController:ModalController,
        protected loadingController:LoadingController,
        protected qrscanner: QRScanner ,
        protected accountService: AccountService,
        protected accountSyncService: AccountSyncService,
        protected navParams: NavParams,
        protected navController: NavController,
        protected translate: TranslateService,
        protected alertController: AlertController,
        protected config: Config
    ) {
        let id = navParams.get('id');
        if (id) {
            Promise.all<any>([
                this.accountService.getAccount(id),
                this.config.get(Config.CONFIG_KEY_DEFAULT_BITCOIN_ACCOUNT),
                this.config.get(Config.CONFIG_KEY_DEFAULT_ETHEREUM_ACCOUNT),
                this.accountService.getAccounts()
            ]).then(promised => {
                this.account = promised[0];
                this.accountDefault = promised[0]._id == promised[1] || promised[0]._id == promised[2];
                this.accountEnabled = false;
                this.canChangeDefaultAccount = promised[3].length > 1 && !this.accountDefault;
            });
        }
    }

    scan() {
        this.qrscanner.scan(text => {
            try {
                let account = this.accountService.parseAccountInput(text);
                this.account.data = account.data;
                return true;
            } catch (e) {
                console.error(e);
                return false;
            }
        });
    }

    ionViewCanLeave() {
        if (this.removed) {
            return true;
        }

        return new Promise<void> ((resolve, reject) => {
            this.save()
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    Promise.all<string>([
                        this.translate.get('TITLE.INVALID_INPUT').toPromise() ,
                        this.translate.get('TEXT.INVALID_ACCOUNT_INPUT').toPromise() ,
                        this.translate.get('BUTTON.OK').toPromise() ,
                        this.translate.get('BUTTON.CANCEL').toPromise()
                    ]).then((texts) => {
                        let alert = this.alertController.create({
                            title: texts[0],
                            subTitle: texts[1],
                            buttons: [
                                {
                                    text: texts[2] ,
                                    handler : () => {
                                        reject();
                                    }
                                }, {
                                    text : texts[3] ,
                                    handler : () => {
                                        resolve();
                                    }
                                }]
                        });
                        alert.present();
                        this.account.data = "";
                    });
            });
        });
    }

    ionViewCanEnter() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.config.get(Config.CONFIG_KEY_PIN).then(value => {
                if (value === '') {
                    resolve();
                } else {
                    let modal:Modal = this.modalController.create('pincode', { token : value, closable : true });

                    modal.present();
                    modal.onDidDismiss(data => {
                        if (data && data.success) {
                            resolve();
                        } else {
                            reject();
                        }
                    })
                }
            });
        });
    }

    save() : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let promise;
                let parsedAccount = this.accountService.parseAccountInput(this.account.data);
                this.account.data = parsedAccount.data;
                this.account.type = parsedAccount.type;

                if (this.account._id) {
                    promise = this.accountService.editAccount(this.account);
                } else {
                    promise = this.addAccount();
                }

                promise.then((account) => {
                    if (this.accountDefault) {
                        const cryptoInUpperCase = parsedAccount.currency.toUpperCase();
                        const configAccountPropertyName = "CONFIG_KEY_DEFAULT_" + cryptoInUpperCase + "_ACCOUNT";

                        resolve(this.config.set(Config[configAccountPropertyName], account._id));
                    } else {
                        resolve();
                    }
                }).catch(() => {
                    reject();
                });
            } catch (e) {
                reject();
            }
        });
    }

    addAccount() : Promise<Account> {
        return new Promise<Account> ((resolve, reject) => {
            this.presentLoader();
            this.accountService.addAccount(this.account)
                .then((account:Account) => {
                    return this.accountSyncService.syncAccount(account);
                }).then(() => {
                    this.dissmissLoader();
                    resolve(this.account);
                }).catch(() => {
                    this.dissmissLoader();
                    resolve(this.account);
                });
        });
    }

    presentLoader() {
        this.translate.get('TEXT.LOADING_TRANSACTIONS').toPromise()
            .then((text:string) => {
                this.loader = this.loadingController.create({
                    content : text
                });
                this.loader.present();
            });
    }

    dissmissLoader() {
        if (this.loader) {
            this.loader.dismiss();
        }
    }

    remove() {
        Promise.all<string>([
            this.translate.get('TEXT.REMOVE_ACCOUNT').toPromise() ,
            this.translate.get('TEXT.REMOVE_ACCOUNT_QUESTION').toPromise() ,
            this.translate.get('BUTTON.OK').toPromise() ,
            this.translate.get('BUTTON.CANCEL').toPromise()
        ]).then((texts) => {
            let alert = this.alertController.create({
                title: texts[0],
                subTitle: texts[1],
                buttons: [
                    {
                        text: texts[2],
                        handler: () => {
                            this.accountService.removeAccount(this.account._id)
                                .then(() => {
                                    this.removed = true;
                                    this.navController.pop();
                                });
                        }
                    },
                    texts[3]
                ]
            });
            alert.present();
        });
    }

}
