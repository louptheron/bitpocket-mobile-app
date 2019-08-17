import { InsightBitcoinTransactionService } from './../../index';
import {data} from './insight-bitcoin-transaction-data';

describe('Transaction Service', () => {

    let transactionService = new InsightBitcoinTransactionService(null, "https://insight.bitpay.com");

    it('should build correct urls', () => {
        expect(transactionService.buildUrl({
            addresses : ['152f1muMCNa7goXYhYAQC61hxEgGacmncB','12ni9ddt4WHfEQriVN7DajDBd1JbKL9yUZ','1FS4FF2SYdHf3PGfSbjpdYcUiUYxiVLy73'] ,
            to : 15 ,
            from : 5
        })).toEqual('https://insight.bitpay.com/api/addrs/152f1muMCNa7goXYhYAQC61hxEgGacmncB,12ni9ddt4WHfEQriVN7DajDBd1JbKL9yUZ,1FS4FF2SYdHf3PGfSbjpdYcUiUYxiVLy73/txs?from=5&to=15');
    });

    it('should find address input', () => {
        let index = transactionService.addressIndex(
            ['ad1','ad2','ad3','ad4'] ,
            ['ad0','ad3']
        );
        expect(index).toEqual(1);
    });

    it('should parse transactions correctly', () => {
        let txs = transactionService.parseTransactions(['19L9LhCArs9SUNu3ZzaqJ1ys3dGgvJmi5T'], data);
        let incomming = [false, true, false, true, false, false, true, true, false, true];
        for (let i = 0; i < incomming.length; i++) {
            expect(txs[i].incomming).toBe(incomming[i]);
        }
    });

});
