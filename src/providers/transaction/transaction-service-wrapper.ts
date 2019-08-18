import { TransactionService } from './../../api/transaction-service';
import { TransactionFilter } from './../../api/transaction-filter';
import { CryptocurrencyService, BlockchainInfoService, InsightBitcoinTransactionService, InsightEthereumTransactionService, BITCOIN, TESTNET, ETHEREUM } from './../index';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transaction } from './../../api/transaction';

@Injectable()
export class TransactionServiceWrapper implements TransactionService {

    protected instances:any = {};

    constructor(protected httpClient:HttpClient, protected cryptocurrencyService:CryptocurrencyService) {}

    init() {
        if (!this.instances[BITCOIN]) {
            this.instances[BITCOIN] = [];
            this.instances[TESTNET] = [];
            this.instances[BITCOIN].push(new BlockchainInfoService(this.httpClient));
            this.instances[BITCOIN].push(new InsightBitcoinTransactionService(this.httpClient, 'https://insight.bitpay.com'));
            this.instances[TESTNET].push(new InsightBitcoinTransactionService(this.httpClient, 'https://test-insight.bitpay.com', TESTNET));

            this.instances[ETHEREUM] = [];
            this.instances[ETHEREUM].push(new InsightEthereumTransactionService(this.httpClient, 'http://api.etherscan.io', ETHEREUM))
        }
    }

    findTransactions(filter: TransactionFilter): Promise<Transaction[]> {
        this.init();
        return this.triggerRandomInstance(filter, this.checkCryptocurrency(filter));
    }

    triggerRandomInstance(filter:TransactionFilter, cryptocurrency:string) {
        return new Promise<Transaction[]> ((resolve, reject) => {

            this.getInstance(cryptocurrency).findTransactions(filter)
                .then(result => {
                    resolve(result);
                }).catch(() => {
                    resolve(this.triggerRandomInstance(filter, cryptocurrency));
                });
        });
    }

    getInstance(cryptocurrency:string) : TransactionService {
        let index = Math.floor(Math.random() * this.instances[cryptocurrency].length);
        return this.instances[cryptocurrency][index];
    }

    checkCryptocurrency(filter: TransactionFilter) : string {
        if (filter.addresses && filter.addresses.length > 0) {
            return this.cryptocurrencyService.parseInput(filter.addresses[0]).currency;
        } else {
            return BITCOIN;
        }
    }

}
