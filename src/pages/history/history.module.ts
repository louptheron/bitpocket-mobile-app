import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LogoModule } from '../../components/logo/logo.module';
import { BitpocketCurrencyPipeModule } from '../../pipes/bitpocket-currency/bitpocket-currency.module';
import { BitpocketUnitPipeModule } from '../../pipes/bitpocket-unit/bitpocket-unit.module';
import { BitcoinFiatPipeModule } from '../../pipes/bitcoin-fiat/bitcoin-fiat.module';
import { EthereumFiatPipeModule } from '../../pipes/ethereum-fiat/ethereum-fiat.module';
import { TranslateModule } from '@ngx-translate/core';
import { HistoryPage } from './history';

@NgModule({
  declarations: [
    HistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(HistoryPage),
    LogoModule ,
    TranslateModule ,
    BitpocketCurrencyPipeModule ,
    BitpocketUnitPipeModule ,
    BitcoinFiatPipeModule,
    EthereumFiatPipeModule
  ],
  exports: [
    HistoryPage
  ]
})
export class HistoryPageModule {}
