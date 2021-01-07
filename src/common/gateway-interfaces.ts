/* eslint-disable @typescript-eslint/no-explicit-any */
import { rp } from '.';
import { paymentGateways } from '../constants';
const { AIRTEL, HALOTEL, DTB, NMB, CRDB, ZANTEL, TIGO, VODACOM, KCB } = paymentGateways;

export class GatewayInterface {
  private apiList: any;
  private gatewayParameters: any;

  async callGateway(req: any): Promise<any> {
    const callRequestOptions: any = {
      url: this.gatewayParameters.baseUrl + this.apiList[req.apiName].verb,
      method: this.apiList[req.apiName].method,
      headers: this.gatewayParameters.headers,
      body: req.body,
      json: this.apiList[req.apiName].json,
    };
    return rp(callRequestOptions)
      .then((res: any) => {
        return Promise.resolve({ ...res });
      })
      .catch((err: any) => {
        return Promise.reject({ ...err });
      });
  }

  constructor(gateway: string) {
    switch (gateway) {
      case AIRTEL:
        this.gatewayParameters = {
          gateway: AIRTEL,
          baseUrl: 'http://localhost:3000/AirtelTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchTransactionsCount: {
            verb: 'FetchTransactionsCount',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case HALOTEL:
        this.gatewayParameters = {
          gateway: HALOTEL,
          baseUrl: 'http://localhost:3000/HalotelTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchTransactionsCount: {
            verb: 'FetchTransactionsCount',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case DTB:
        this.gatewayParameters = {
          gateway: DTB,
          baseUrl: 'http://localhost:3000/DtbTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case NMB:
        this.gatewayParameters = {
          gateway: NMB,
          baseUrl: 'http://localhost:3000/NmbTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case CRDB:
        this.gatewayParameters = {
          gateway: CRDB,
          baseUrl: 'http://localhost:3000/CrdbTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case ZANTEL:
        this.gatewayParameters = {
          gateway: ZANTEL,
          baseUrl: 'http://localhost:3000/ZantelTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchTransactionsCount: {
            verb: 'FetchTransactionsCount',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case TIGO:
        this.gatewayParameters = {
          gateway: TIGO,
          baseUrl: 'http://localhost:3000/TigoTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchTransactionsCount: {
            verb: 'FetchTransactionsCount',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case VODACOM:
        this.gatewayParameters = {
          gateway: VODACOM,
          baseUrl: 'http://localhost:3000/VodacomTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchTransactionsCount: {
            verb: 'FetchTransactionsCount',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      case KCB:
        this.gatewayParameters = {
          gateway: KCB,
          baseUrl: 'http://localhost:3000/KcbTransactions/',
          headers: {
            'Content-Type': 'application/json',
          },
        };
        this.apiList = {
          addTransaction: {
            verb: 'PostTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          updateTransaction: {
            verb: 'UpdateTransaction',
            method: 'POST',
            json: true,
            body: {
              UpdateFilter: {},
              UpdateAttributes: {},
            },
          },
          fetchTransaction: {
            verb: 'FetchTransaction',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchMultipleTransactions: {
            verb: 'FetchMultipleTransactions',
            method: 'POST',
            json: true,
            body: {},
          },
          fetchTransactionsCount: {
            verb: 'FetchTransactionsCount',
            method: 'POST',
            json: true,
            body: {},
          },
        };
        break;

      default:
        break;
    }
  }
}
