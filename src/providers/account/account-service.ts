import {Injectable} from '@angular/core';
import { Account } from '../../api/account';
import { Config, CryptocurrencyService, Repository, ETHEREUM, BITCOIN } from './../index';

export const ACCOUNT_TYPE_BITCOIN_ADDRESS  = "bitcoin-static-address";
export const ACCOUNT_TYPE_BITCOIN_XPUB_KEY = "bitcoin-xpub-key";
export const ACCOUNT_TYPE_TESTNET_ADDRESS  = "testnet-static-address";
export const ACCOUNT_TYPE_TESTNET_TPUB_KEY = "testnet-tpub-key";

export const ACCOUNT_TYPE_ETHEREUM_ADDRESS  = "ethereum-static-address";


@Injectable()
export class AccountService {

    constructor(
        protected cryptocurrencyService: CryptocurrencyService,
        protected config:Config,
        protected repository:Repository) {}

    parseAccountInput(input:string) : Account {
        return this.cryptocurrencyService.parseInput(input);
    }

    addAccount(account:Account) : Promise<Account> {
        return new Promise<Account> ((resolve,reject) => {
            account['doctype'] = 'account';

            // default values
            account.index = 0;
            account.lastConfirmedIndex = -1;

            this.repository.addDocument(account)
                .then((response) => {
                    account._id = response.id;
                    resolve(account);
                }).catch((e) => {
                    reject(e);
                });
        });
    }

    editAccount(account:Account) : Promise<Account> {
        return new Promise<Account> ((resolve, reject) => {
            account['doctype'] = 'account';
            this.repository.addOrEditDocument(account)
                .then(() => {
                    resolve(account);
                }).catch((e) => {
                    reject(e);
                });
        });
    }

    getAccounts() : Promise<Array<Account>> {
        return new Promise<Array<Account>>((resolve,reject) => {
            this.repository.findByDocumentType('account')
                .then(result => {
                    resolve(result);
                })
                .catch(() => {
                    reject();
                });
        });
    }

    getAccount(id:string) : Promise<Account> {
        return new Promise<Account>((resolve, reject) => {
            this.repository.findById(id)
                .then(account => {
                    if (account['doctype'] == 'account') {
                        resolve(account);
                    } else {
                        reject();
                    }
                }).catch(() => {
                    reject();
                });
        });
    }

    removeAccount(id:string) : Promise<void> {
        return new Promise<void> ((resolve, reject) => {
            Promise.all([
                this.getAccounts() ,
                this.config.get(Config.CONFIG_KEY_DEFAULT_BITCOIN_ACCOUNT),
                this.config.get(Config.CONFIG_KEY_DEFAULT_ETHEREUM_ACCOUNT)
            ]).then((promised:any) => {
                if (promised[0].length > 1 && id != promised[1] && id != promised[2]) {
                    resolve(this.repository.removeDocument(id));
                } else if (promised[0].length > 1 && id == promised[1]) { // BITCOIN
                    // select an account which is not the default Account, and set it as the default account
                    let bitcoinAccounts = promised[0].filter(account => account.currency == BITCOIN)
                    for (let i = 0; i < bitcoinAccounts.length; i++) {
                        if (bitcoinAccounts[i]._id != id) {
                            this.config.set(Config.CONFIG_KEY_DEFAULT_BITCOIN_ACCOUNT, bitcoinAccounts[i]._id);
                            break;
                        }
                    }
                    resolve(this.repository.removeDocument(id));
                } else if (promised[0].length > 1 && id == promised[2]) { // ETHEREUM
                    // select an account which is not the default Account, and set it as the default account
                    for (let i = 0; i < promised[0].length; i++) {
                      let ethereumAccounts = promised[0].filter(account => account.currency == ETHEREUM)
                      for (let i = 0; i < ethereumAccounts.length; i++) {
                          if (ethereumAccounts[i]._id != id) {
                              this.config.set(Config.CONFIG_KEY_DEFAULT_ETHEREUM_ACCOUNT, ethereumAccounts[i]._id);
                              break;
                          }
                      }
                    }
                    resolve(this.repository.removeDocument(id));
                } else {
                    reject();
                }
            });
        });
    }

    getDefaultAccount(crypto: string) : Promise<Account> {
        return new Promise<Account> ((resolve, reject) => {
            const configAccountPropertyForCrypto = "CONFIG_KEY_DEFAULT_" + crypto.toUpperCase() + "_ACCOUNT";
console.log(configAccountPropertyForCrypto, Config[configAccountPropertyForCrypto])
            this.config.get(Config[configAccountPropertyForCrypto])
                .then(accountId => {
                    return this.getAccount(accountId);
                }).then(account => {
                    resolve(account);
                }).catch(() => {
                    // stored default account id, is not available anymore
                    return this.getAccounts()
                }).then((accounts:any[]) => {
                    if (accounts && accounts.length > 0) {
                        return this.config.set(Config[configAccountPropertyForCrypto], accounts[0]._id);
                    } else {
                        reject('no accounts available');
                    }
                }).then(() => {
                    //resolve(this.getDefaultAccount(crypto));
                });
        });
    }

    getDefaultAddress(crypto: string) : Promise<string> {
        return new Promise<string> ((resolve, reject) => {
            this.getDefaultAccount(crypto).then(account => {
                    try {
                        resolve(this.getNextAddress(account));
                    } catch (e) {
                        reject(e);
                    }
                }).catch(() => {
                    reject("couldn't find default address");
                });
        });
    }

    deriveAddress(account:Account, index:number) {
        return this.cryptocurrencyService.deriveAddress(account.data, index);
    }

    getNextAddress(account:Account) : string {
        if(this.isAddressAccount(account)) {
            return account.data;
        }  else {
            return this.deriveAddress(account, account.index + 1);
        }
    }

    isAddressAccount(account:Account) {
        return /static-address/.test(account.type);
    }

    isTestnetAccount(account:Account) {
        return /testnet/.test(account.type);
    }

}
