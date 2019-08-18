import { PaymentRequestHandler } from './../../../api/payment-request-handler';
import { TransactionService } from './../../../api/transaction-service';
import { PaymentRequest, PAYMENT_STATUS_SERVICE_ERROR, PAYMENT_STATUS_RECEIVED, PAYMENT_STATUS_PARTIAL_PAID, PAYMENT_STATUS_OVERPAID } from './../../../api/payment-request';
import { EventEmitter } from 'events';
import { HttpClient } from '@angular/common/http';
import Web3 from 'web3';
import { fetch } from 'whatwg-fetch';
import { ETHEREUM } from '../../index';

const ETHERSCAN_API_KEY = "DEI8KRP8S6ZFDWEWMZSI8NPZAX6RMFESDE";

export class InsightEthereumPaymentRequestHandler extends EventEmitter implements PaymentRequestHandler {

    protected _paymentRequest: PaymentRequest;
    protected subscription: any;
    protected transactionService: TransactionService;
    protected wsServiceUrl: string;
    protected httpServiceUrl: string;
    protected http: HttpClient;

    get paymentRequest() : PaymentRequest {
        return this._paymentRequest;
    }

    constructor() {
        super();
    }

    static createEthereumPaymentRequestHandler(paymentRequest: PaymentRequest, transactionService: TransactionService, wsServiceUrl:string, httpServiceUrl:string, http: HttpClient) {
        let handler = new InsightEthereumPaymentRequestHandler();
        handler._paymentRequest = paymentRequest;
        handler.transactionService = transactionService;
        handler.wsServiceUrl = wsServiceUrl;
        handler.httpServiceUrl = httpServiceUrl;
        handler.http = http;
        handler.init();
        return handler;
    }

    retry(operation, parameter, retries = 10): any {
      return new Promise((resolve, reject) => {
          if(!retries) {
              return reject("Missed block " + parameter);
          }

          operation(parameter)
            .then(body => {
                return body.json();
            })
            .then(body => {
                if(body.result == null) {
                    console.log("retrying...")
                    setTimeout(() => {
                        this.retry(operation, parameter, retries - 1).then(resolve, reject)
                    }, 1000)
                } else {
                    return resolve(body.result);
                }
            });
      })
    }


    init() {
        try {
            let web3 = new Web3(this.wsServiceUrl + "/ws/v3/073bbc7c916b4709876112c88eeba6a2");
            this.subscription = web3.eth.subscribe('newBlockHeaders', (error, result) => {})
              .on("data", block => {
                if(block.hash != null) {
                      this.retry(fetch, this.httpServiceUrl + '/api?module=proxy&action=eth_getBlockByNumber&tag=' + block.number.toString(16) + '&boolean=true&apikey=' + ETHERSCAN_API_KEY, 10)
                      .then(block => {
                          console.log("Received new block", block);

                          block.transactions.forEach(transaction => {
                              if(transaction.to == this.paymentRequest.address) {
                                  console.log("FOUND TX!");
                                  this.triggerStatusUpdate(transaction)
                                      .then((close:boolean) => {
                                          if (close && this && this.cancel) {
                                              this.cancel();
                                          }
                                      });
                              }
                          })
                      }).catch(e => {
                          console.log(e);
                          this.emit("payment-status:" + PAYMENT_STATUS_SERVICE_ERROR);
                      })
                }
              })
        } catch (e) {
            this.emit("payment-status:" + PAYMENT_STATUS_SERVICE_ERROR);
        }
    }

    triggerStatusUpdate(transaction:any) : Promise<boolean> {
        return new Promise<boolean> ((resolve, reject) => {
          let amount = parseInt(transaction.value, 16);
          let event = {
              txid    : transaction.hash ,
              address : this.paymentRequest.address ,
              amount  : amount ,
              currency: ETHEREUM
          };

          if (amount.toString().substr(0, 9) < this.paymentRequest.amount.toString().substr(0, 9)) {
              this.emit("payment-status:" + PAYMENT_STATUS_PARTIAL_PAID, event);
          } else if ((amount.toString().length > this.paymentRequest.amount.toString().length) || (amount.toString().substr(0, 9) > this.paymentRequest.amount.toString().substr(0, 9))) {
              this.emit("payment-status:" + PAYMENT_STATUS_OVERPAID, event);
          } else {
              this.emit("payment-status:" + PAYMENT_STATUS_RECEIVED, event);
          }
        });
    }

    cancel() {
        // unsubscribes the subscription
        this.subscription.unsubscribe(function (error, success) {
            if (success)
                console.log('Successfully unsubscribed from WS!');
        });
    }

}
