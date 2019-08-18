export interface CryptoUnit {
  value: number;
  to(unit?: string) : number;
  toFiat(exchangeRate: number, decimals?: number) : number;
}
