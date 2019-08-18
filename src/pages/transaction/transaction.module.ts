import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BitpocketCurrencyPipeModule } from '../../pipes/bitpocket-currency/bitpocket-currency.module';
import { BitpocketUnitPipeModule } from '../../pipes/bitpocket-unit/bitpocket-unit.module';
import { BitcoinFiatPipeModule } from '../../pipes/bitcoin-fiat/bitcoin-fiat.module';
import { EthereumFiatPipeModule } from '../../pipes/ethereum-fiat/ethereum-fiat.module';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionPage } from './transaction';

@NgModule({
  declarations: [
    TransactionPage,
  ],
  imports: [
    IonicPageModule.forChild(TransactionPage),
    TranslateModule ,
    BitpocketCurrencyPipeModule ,
    BitpocketUnitPipeModule ,
    BitcoinFiatPipeModule ,
    EthereumFiatPipeModule
  ],
})
export class TransactionPageModule {}
