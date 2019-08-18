import {Injectable} from '@angular/core';
import {CurrencyExchangeService} from '../../api/currency-exchange-service';
import {CurrencyExchangeRate} from '../../api/currency-exchange-rate';
import {Config, BitcoinAverageExchangeService, EthereumAverageExchangeService} from './../index';

@Injectable()
export class CurrencyService {

    constructor(protected config: Config,
                protected bitcoinExchangeService: BitcoinAverageExchangeService,
                protected ethereumExchangeService: EthereumAverageExchangeService) {
    }

    getFeePercentage() : Promise<number> {
        return this.config.get(Config.CONFIG_KEY_FEE_PERCENTAGE);
    }

    getBitcoinExchangeService() : CurrencyExchangeService {
        return this.bitcoinExchangeService;
    }

    getEthereumExchangeService() : CurrencyExchangeService {
        return this.ethereumExchangeService;
    }

    getSelectedCurrency() : Promise<any> {
        return this.config.get(Config.CONFIG_KEY_CURRENCY);
    }

    getSelectedBitcoinCurrencyRate() : Promise<number> {
        return this.config.get(Config.CONFIG_KEY_BITCOIN_EXCHANGE_RATE).then(rate => {
            return parseFloat(rate);
        });
    }

    getSelectedEthereumCurrencyRate() : Promise<number> {
        return this.config.get(Config.CONFIG_KEY_ETHEREUM_EXCHANGE_RATE).then(rate => {
            return parseFloat(rate);
        });
    }

    getCalculatedBitcoinCurrencyRate() : Promise<number> {
        return new Promise<number> ((resolve, reject) => {
            Promise.all([
                this.config.get(Config.CONFIG_KEY_BITCOIN_EXCHANGE_RATE) ,
                this.config.get(Config.CONFIG_KEY_FEE_PERCENTAGE)
            ]).then(values => {
                resolve(parseFloat(values[0]) * ((100.0 - parseFloat(values[1]))/100.0));
            });
        });
    }

    getCalculatedEthereumCurrencyRate() : Promise<number> {
        return new Promise<number> ((resolve, reject) => {
            Promise.all([
                this.config.get(Config.CONFIG_KEY_ETHEREUM_EXCHANGE_RATE) ,
                this.config.get(Config.CONFIG_KEY_FEE_PERCENTAGE)
            ]).then(values => {
                resolve(parseFloat(values[0]) * ((100.0 - parseFloat(values[1]))/100.0));
            });
        });
    }

    getAvailableCurrencies() : Promise<any> {
        return new Promise<any>((resolve, reject) => {
          // The currencies are the same for ETH
            resolve(this.getBitcoinExchangeService().getAvailableCurrencies());
        });
    }

    setSelectedCurrency(code:string) : CurrencyService {
        this.config.set(Config.CONFIG_KEY_CURRENCY, code).then(() => {
          this.updateBitcoinCurrencyRate();
          this.updateEthereumCurrencyRate();
        });
        return this;
    }

    setFeePercentage(feePercentage:number) : CurrencyService {
        this.config.set(Config.CONFIG_KEY_FEE_PERCENTAGE, feePercentage);
        return this;
    }

    updateBitcoinCurrencyRate() : Promise<CurrencyExchangeRate> {
        return new Promise<CurrencyExchangeRate>((resolve,reject) => {
            Promise.all<any>([
                this.getBitcoinExchangeService() ,
                this.getSelectedCurrency()
            ]).then(promised => {
                promised[0].getExchangeRate(promised[1]).then(data => {
                    this.config.set(Config.CONFIG_KEY_BITCOIN_EXCHANGE_RATE, data.rate);

                    resolve({
                        'code'   : promised[1] ,
                        'rate'   : data.rate
                    });
                }).catch(reject);
            }).catch(reject);
        });
    }

    updateEthereumCurrencyRate() : Promise<CurrencyExchangeRate> {
        return new Promise<CurrencyExchangeRate>((resolve,reject) => {
            Promise.all<any>([
                this.getEthereumExchangeService() ,
                this.getSelectedCurrency()
            ]).then(promised => {
                promised[0].getExchangeRate(promised[1]).then(data => {
                    this.config.set(Config.CONFIG_KEY_ETHEREUM_EXCHANGE_RATE, data.rate);

                    resolve({
                        'code'   : promised[1] ,
                        'rate'   : data.rate
                    });
                }).catch(reject);
            }).catch(reject);
        });
    }

    /**
     * Format a number, fillup with 0 until minDecimals is reached, cut at maxDecimals
     */
    formatNumber(value: number, separator: string, maxDecimals: number = 2, minDecimals: number = 2) : string {
        let formattedNumber = value.toFixed(maxDecimals).replace(/\./,separator);

        if (minDecimals >= maxDecimals) {
            return formattedNumber;
        } else {
            let startLength = (formattedNumber.indexOf(separator) + minDecimals);
            let endIndex    = formattedNumber.length - 1;
            while (startLength < endIndex) {
                if (formattedNumber[endIndex] != "0") {
                    break;
                } else {
                    formattedNumber = formattedNumber.substr(0,formattedNumber.length-1);
                }

                endIndex--;
            }
        }

        return formattedNumber;
    }

}
