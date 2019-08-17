import {EthereumUnit} from './ethereum-unit'

describe('Ethereum Unit', () => {

    it('from eth input with many decimals', () => {
        let eU = EthereumUnit.from(1.433556, 'ETH');
        expect(eU.to('Wei')).toEqual(1433556000000000000);
    });

    it('from Wei input to different units', () => {
        let eU = EthereumUnit.from(1000000000000000000);

        expect(eU.to('ETH')).toEqual(1);
        expect(eU.to('GWei')).toEqual(1000000000);
    });

    it('from fiat to ETH', () => {
        // 200 Fiat is 1 BTC
        let eU = EthereumUnit.fromFiat(100,200);
        expect(eU.to('ETH')).toEqual(0.5);
    });

    it('from ETH to Fiat', () => {
        // 420.50 Fiat is 1 ETH
        let eU = EthereumUnit.from(350,'ETH');
        expect(eU.toFiat(420.5,3)).toEqual(147175);
    });

});
