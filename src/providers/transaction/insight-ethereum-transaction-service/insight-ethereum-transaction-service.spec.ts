import { InsightEthereumTransactionService } from './../../index';
import {data} from './insight-ethereum-transaction-data';

describe('Ethereum Transaction Service', () => {

    let transactionService = new InsightEthereumTransactionService(null, "http://api.etherscan.io");

    it('should build correct urls', () => {
        expect(transactionService.buildUrl({
            addresses : ['0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae'] ,
            to : 15 ,
            from : 5
        })).toEqual('http://api.etherscan.io/api?module=account&action=txlist&address=0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae&startblock=0&endblock=99999999&sort=asc&apikey=DEI8KRP8S6ZFDWEWMZSI8NPZAX6RMFESDE');
    });

    it('should find address input', () => {
        let index = transactionService.addressIndex(
            ['ad1','ad2','ad3','ad4'] ,
            ['ad0','ad3']
        );
        expect(index).toEqual(1);
    });

    it('should parse transactions correctly', () => {
        let txs = transactionService.parseTransactions(['0x11a615a743357334b2393a8244bfd795356d00b6'], data);
        let incomming = [true];
        for (let i = 0; i < incomming.length; i++) {
            expect(txs[i].incomming).toBe(incomming[i]);
        }
    });

});
