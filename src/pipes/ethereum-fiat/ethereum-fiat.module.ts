import { NgModule } from '@angular/core';
import { EthereumFiatPipe } from './ethereum-fiat';

@NgModule({
  declarations: [EthereumFiatPipe],
  exports: [EthereumFiatPipe]
})
export class EthereumFiatPipeModule {}
