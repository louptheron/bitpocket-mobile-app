
const ETHEREUM_UNITS = {
    'ETH'  :     [1e18,18] ,
    'GWei' :     [1e9,9] ,
    'Wei'  :     [1,0]
};

export class EthereumUnit {
    // internal representation is in satoshis
    private wei: number = 0;

    set value(value: number) {
        this.wei = value;
    }

    constructor(value: number) {
        this.wei = value;
    }

    static decimalsCount(ethereumUnit) : number {
        return EthereumUnit.getUnitSpecification(ethereumUnit)[1];
    }

    static getUnitSpecification(ethereumUnit: string) : Array<number> {
        if (!ETHEREUM_UNITS.hasOwnProperty(ethereumUnit)) { // fallback to Wei...
            ethereumUnit = 'Wei';
        }
        return ETHEREUM_UNITS[ethereumUnit];
    }

    static from(value: number, ethereumUnit: string = 'Wei') : EthereumUnit {
        let unitSpec = EthereumUnit.getUnitSpecification(ethereumUnit);
        return new EthereumUnit( parseInt((value * unitSpec[0]).toFixed(0)) );
    }

    static fromFiat(fiatValue: number, exchangeRate: number) : EthereumUnit {
        let valueInETH:number = fiatValue / exchangeRate;
        return EthereumUnit.from(valueInETH, 'ETH');
    }

    to(ethereumUnit: string = 'Wei') : number {
        let unitSpec = EthereumUnit.getUnitSpecification(ethereumUnit);
        return parseFloat( (this.wei / unitSpec[0]).toFixed(unitSpec[1]) );
    }

    toFiat(exchangeRate: number, decimals: number = 2) : number {
        let ethValue = this.to('ETH');
        return parseFloat((ethValue * exchangeRate).toFixed(decimals));
    }

    toString() {
        return this.wei.toFixed(0);
    }

}
