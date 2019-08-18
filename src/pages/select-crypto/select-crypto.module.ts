import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LogoModule } from '../../components/logo/logo.module';
import { DynamicFontSizeModule } from '../../components/dynamic-font-size/dynamic-font-size.module';
import { SelectCryptoPage } from './select-crypto';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectCryptoPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectCryptoPage),
    TranslateModule ,
    DynamicFontSizeModule ,
    LogoModule
  ],
  exports: [
    SelectCryptoPage
  ]
})
export class SelectCryptoPageModule {}
