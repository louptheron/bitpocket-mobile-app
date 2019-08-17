import { NgModule } from '@angular/core';
import { BitcoinFiatPipe } from './bitcoin-fiat';

@NgModule({
  declarations: [BitcoinFiatPipe],
  exports: [BitcoinFiatPipe]
})
export class BitcoinFiatPipeModule {}
