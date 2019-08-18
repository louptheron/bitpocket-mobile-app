import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TransactionServiceWrapper, InsightBitcoinPaymentRequestHandler, InsightEthereumPaymentRequestHandler, CryptocurrencyService, BITCOIN, TESTNET, ETHEREUM } from '../index';
import { PaymentRequest } from './../../api/payment-request';
import { PaymentRequestHandler } from './../../api/payment-request-handler';
import * as payment from '../../api/payment-service';

@Injectable()
export class PaymentService implements payment.PaymentService {

    constructor(
        protected http: HttpClient ,
        protected transactionService: TransactionServiceWrapper ,
        protected cryptocurrencyService: CryptocurrencyService
    ) {}

    createPaymentRequestHandler(paymentRequest: PaymentRequest) : PaymentRequestHandler {
        let currency = this.cryptocurrencyService.parseInput(paymentRequest.address).currency;

        if (currency == BITCOIN) {
            return InsightBitcoinPaymentRequestHandler.createBitcoinPaymentRequestHandler(paymentRequest, this.transactionService, 'https://insight.bitpay.com');
        } else if (currency == ETHEREUM) {
            return InsightEthereumPaymentRequestHandler.createEthereumPaymentRequestHandler(paymentRequest, this.transactionService, 'wss://mainnet.infura.io/ws', 'https://api.etherscan.io', this.http);
        } else if (currency == TESTNET) {
            return InsightBitcoinPaymentRequestHandler.createBitcoinPaymentRequestHandler(paymentRequest, this.transactionService, 'https://test-insight.bitpay.com');
        }
    }

}
