import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';

@Injectable()
export class Config {

    constructor(
        protected storage: Storage
    ) {}

    static CONFIG_KEY_PAYMENT_REQUEST_LABEL = 'payment-request-label';
    static CONFIG_KEY_CURRENCY = 'currency';
    static CONFIG_KEY_BITCOIN_UNIT = 'bitcoin-unit';
    static CONFIG_KEY_ETHEREUM_UNIT = 'ethereum-unit';
    static CONFIG_KEY_BITCOIN_EXCHANGE_RATE = 'bitcoin-rate';
    static CONFIG_KEY_ETHEREUM_EXCHANGE_RATE = 'ethereum-rate';
    static CONFIG_KEY_PIN = 'pin';
    static CONFIG_KEY_DEFAULT_BITCOIN_ACCOUNT = 'default-bitcoin-account';
    static CONFIG_KEY_DEFAULT_ETHEREUM_ACCOUNT = 'default-ethereum-account';
    static CONFIG_KEY_CURRENCY_CACHE = 'currency-cache';
    static CONFIG_KEY_FEE_PERCENTAGE = 'fee-percentage';

    initConfig() : Promise<boolean> {
        return new Promise<boolean>((resolve,reject) => {
            Promise.all<any>([
                this.initialize(Config.CONFIG_KEY_BITCOIN_EXCHANGE_RATE,-1),
                this.initialize(Config.CONFIG_KEY_ETHEREUM_EXCHANGE_RATE,-1),
                this.initialize(Config.CONFIG_KEY_CURRENCY,'EUR'),
                this.initialize(Config.CONFIG_KEY_BITCOIN_UNIT,'mBTC'),
                this.initialize(Config.CONFIG_KEY_ETHEREUM_UNIT,'Wei'),
                this.initialize(Config.CONFIG_KEY_PIN,''),
                this.initialize(Config.CONFIG_KEY_FEE_PERCENTAGE,0),
                this.initialize(Config.CONFIG_KEY_CURRENCY_CACHE, [{
                    code : 'EUR', rate : 0
                }, {
                    code : 'USD' , rate : 0
                }])
            ]).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }

    isSet(key:string) : Promise<boolean> {
        return new Promise<boolean>((resolve,reject) => {
            this.storage.get(key).then(storedValue => {
                if (storedValue === null || storedValue === undefined) {
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

    /**
     * init the key with the given value, only!
     * if there is no value set already
     */
    initialize(key:string, value:any) : Promise<boolean> {
        return new Promise<boolean>((resolve,reject) => {
            this.isSet(key).then(status => {
                if (!status) {
                    this.storage.set(key,value);
                }
                resolve(true);
            }).catch(() => {
                resolve(false);
            });
        });
    }

    set(key:string, value:any) : Promise<any> {
        return this.storage.set(key, value);
    }

    get(key:string) : Promise<any> {
        return this.storage.get(key);
    }

}
