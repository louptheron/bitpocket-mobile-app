import { TransactionServiceWrapper } from './transaction/transaction-service-wrapper';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { ModalController } from 'ionic-angular';
import { TransactionStorageService } from './transaction/transaction-storage-service';
import { InsightBitcoinTransactionService } from './transaction/insight-bitcoin-transaction-service/insight-bitcoin-transaction-service';
import { InsightEthereumTransactionService } from './transaction/insight-ethereum-transaction-service/insight-ethereum-transaction-service';
import { BlockchainInfoService } from './transaction/blockchain-info-service/blockchain-info-service';
import { QRScanner } from './qrscanner/qrscanner';
import { PaymentService } from './payment/payment-service';
import { InsightPaymentRequestHandler } from './payment/payment-request-handler/insight-payment-request-handler';
import { BitcoinAverageExchangeService } from './currency/bitcoinaverage-service';
import { EthereumAverageExchangeService } from './currency/ethereumaverage-service';
import { BitcoinUnit } from './currency/bitcoin-unit';
import { EthereumUnit } from './currency/ethereum-unit';
import { CurrencyService } from './currency/currency-service';
import { AccountService, ACCOUNT_TYPE_BITCOIN_ADDRESS, ACCOUNT_TYPE_BITCOIN_XPUB_KEY, ACCOUNT_TYPE_TESTNET_ADDRESS, ACCOUNT_TYPE_TESTNET_TPUB_KEY, ACCOUNT_TYPE_ETHEREUM_ADDRESS } from './account/account-service';
import { AccountSyncService } from './account/account-sync-service';
import { Repository } from './repository';
import { Config } from './config';
import {
    CryptocurrencyService ,
    BITCOIN,
    ETHEREUM,
    TESTNET,
    BITCOIN_ADDRESS,
    ETHEREUM_ADDRESS,
    BITCOIN_XPUB_KEY,
    TESTNET_ADDRESS,
    TESTNET_TPUB_KEY,
    REGEX_BITCOIN_ADDRESS,
    REGEX_BITCOIN_URI,
    REGEX_TESTNET_ADDRESS,
    REGEX_TESTNET_URI,
    REGEX_ETHEREUM_ADDRESS,
    REGEX_XPUB_KEY,
    REGEX_TPUB_KEY
} from './currency/cryptocurrency-service';

export function provideCurrencyService(config:Config, bitcoinExchangeService:BitcoinAverageExchangeService, ethereumExchangeService:EthereumAverageExchangeService) {
    return new CurrencyService(config, bitcoinExchangeService, ethereumExchangeService);
}

export function provideAccountService(cryptocurrencyService:CryptocurrencyService, config:Config, repository:Repository) {
    return new AccountService(cryptocurrencyService, config, repository);
}

export function provideAccountSyncService(transactionService:TransactionServiceWrapper, transactionStorageService:TransactionStorageService, accountService:AccountService, cryptocurrencyService:CryptocurrencyService) {
    return new AccountSyncService(transactionService, transactionStorageService, accountService, cryptocurrencyService);
}

export function provideTransactionService(http:HttpClient, cryptocurrencyService:CryptocurrencyService) {
    return new TransactionServiceWrapper(http, cryptocurrencyService);
}

export function provideTransactionStorageService(repository:Repository) {
    return new TransactionStorageService(repository);
}

export function providePaymentService(transactionService:TransactionServiceWrapper, cryptocurrencyService:CryptocurrencyService) {
    return new PaymentService(transactionService, cryptocurrencyService);
}

export function provideCryptocurrencyService() {
    return new CryptocurrencyService();
}

export function provideRepository() {
    return new Repository();
}

export function provideConfig(storage:Storage) {
    return new Config(storage);
}

export function provideQRScanner(modalController: ModalController) {
    return new QRScanner(modalController);
}

export function provideBitcoinAverageExchangeService(http:HttpClient, config:Config) {
    return new BitcoinAverageExchangeService(http, config);
}

export function provideEthereumAverageExchangeService(http:HttpClient, config:Config) {
    return new EthereumAverageExchangeService(http, config);
}

export {
    Config ,
    Repository ,
    BitcoinUnit ,
    EthereumUnit ,
    AccountService ,
    AccountSyncService,
    CurrencyService ,
    CryptocurrencyService ,
    BitcoinAverageExchangeService,
    EthereumAverageExchangeService,
    InsightPaymentRequestHandler,
    PaymentService,
    QRScanner,
    TransactionStorageService,
    InsightBitcoinTransactionService,
    InsightEthereumTransactionService,
    BlockchainInfoService,
    TransactionServiceWrapper,
    BITCOIN,
    TESTNET,
    ETHEREUM,
    BITCOIN_ADDRESS,
    BITCOIN_XPUB_KEY,
    TESTNET_ADDRESS,
    TESTNET_TPUB_KEY,
    ETHEREUM_ADDRESS,
    REGEX_BITCOIN_ADDRESS,
    REGEX_BITCOIN_URI,
    REGEX_TESTNET_ADDRESS,
    REGEX_TESTNET_URI,
    REGEX_ETHEREUM_ADDRESS,
    REGEX_XPUB_KEY,
    REGEX_TPUB_KEY,
    ACCOUNT_TYPE_BITCOIN_ADDRESS,
    ACCOUNT_TYPE_BITCOIN_XPUB_KEY,
    ACCOUNT_TYPE_TESTNET_ADDRESS,
    ACCOUNT_TYPE_TESTNET_TPUB_KEY,
    ACCOUNT_TYPE_ETHEREUM_ADDRESS
};
