import { TransactionService } from './../../../api/transaction-service';
import { TransactionFilter } from './../../../api/transaction-filter';
import { CryptocurrencyService, ETHEREUM } from './../../index';
import { HttpClient } from '@angular/common/http';
import { Transaction } from './../../../api/transaction';

const ETHERSCAN_API_KEY = "DEI8KRP8S6ZFDWEWMZSI8NPZAX6RMFESDE";

export class InsightEthereumTransactionService implements TransactionService {

    constructor(
        protected http:HttpClient,
        protected serviceUrl:string,
        protected cryptocurrency:string = ETHEREUM) {}

    findTransactions(filter:TransactionFilter) : Promise<Transaction[]> {
        return new Promise((resolve, reject) => {
            this.http.get(this.buildUrl(filter))
                .subscribe(response => {
                    resolve(this.parseTransactions(filter.addresses, response, filter.txid));
                }, () => { reject(); });
        });
    }

    parseTransaction(transaction:any, addresses:string[]) {
        if (transaction) {
          let addressIndex = addresses.indexOf(transaction.to);
          if (addressIndex >= 0) {
              // TODO: same address in vin multiple times?
              return {
                  amount : parseFloat(transaction.value) ,
                  incomming : true ,
                  address : addresses[addressIndex]
              };
          }
        }
        return null;
    }

    parseTransactions(addresses:string[], json:any, txHash: string) : Transaction[] {
        let output = [];
        let items = [];

        if (json.result && json.result.length) {
            items = json.result;
        } else {
            items.push(json);
        }

        if (txHash) {
          items = items.filter(item => item.hash == txHash)
        }

        for (let item of items) {
            let tx:any = this.parseTransaction(item, addresses)

            if (tx) {
                tx.currency = "ETH";
                tx._id = item.hash;
                tx.confirmations = parseInt(item.confirmations);
                tx.timestamp = parseInt(item.timeStamp);
                output.push(tx);
            }
        }
        return output;
    }

    /**
     * returns index of addressesAsSearchInput array, which is found inside
     * addressesToSearchFor array
     */
    addressIndex(addressesToSearchFor:string[], addressesAsSearchInput:string[]) : number {
        for (let i = 0; i < addressesAsSearchInput.length; i++) {
            if (addressesToSearchFor.indexOf(addressesAsSearchInput[i]) >= 0) {
                return i;
            }
        }
        return -1;
    }

    buildUrl(filter:any = {}) : string {
        let url = "";

        if (filter.addresses && filter.addresses.length > 0) {
            url = this.serviceUrl + "/api";
            url += '?module=account&action=txlist&address=' + filter.addresses.join(',') + '&startblock=0&endblock=99999999&sort=asc&apikey=' + ETHERSCAN_API_KEY;
        }

        // TODO Use filters for perf
        //if (filter.from >= 0 && filter.to > 0) {
        //    url += '?from=' + filter.from + '&to=' + filter.to;
        //}

        return url;
    }

}
