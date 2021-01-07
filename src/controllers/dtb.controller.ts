import { dtbDef } from '../api-specs/dtb-transactions';
import { api, Filter, GatewayInterface, repository, Utils, xml2Json } from '../common';
import { ApiList, DtbTransactionConstant, paymentGateways, STATUS } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { RabbitMqProducer } from '../queue';
import { PaymentPartnerRepository, PaymentVendorRepository } from '../repositories';
export const dtbRabbitMq = new RabbitMqProducer('gateway');
const log = new LoggingInterceptor('dtb.Controllers');

@api(dtbDef)
export class DtbTransactions {
  constructor(
    @repository(PaymentVendorRepository)
    public paymentVendorRepository: PaymentVendorRepository,

    @repository(PaymentPartnerRepository)
    public paymentPartnerRepository: PaymentPartnerRepository,
  ) {}
  private dtbGatewayParams: any = new GatewayInterface(paymentGateways['DTB']);
  private dtbTransactionConstant: any = DtbTransactionConstant;

  generateValidateAccountRequestXml(data: any) {
    let xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:acc="http://dsbflex.dtbafrica.com/accountservice/DSBAccountService/AccountValidation/">
    <soapenv:Header />
    <soapenv:Body>
      <acc:DSB_VALACCOUNT_REQ>
        <acc:DSB_HEADER>`;
    let integrationPartner = data.integrationPartner;
    let userDetails = data.userDetails;
    for (const key in integrationPartner) {
      xmlData += ` <acc:${key.toUpperCase()}>${
        integrationPartner[key]
      }<acc:/${key.toUpperCase()}> `;
    }
    xmlData += `<acc:SERVICE>DSBAccountService</acc:SERVICE>
    <acc:OPERATION>ValidateAccount</acc:OPERATION>
  </acc:DSB_HEADER>
  <acc:DSB_BODY>
    <acc:ACCOUNT_REQUEST_DETAIL>`;
    for (const key in userDetails) {
      xmlData += ` <acc:${key.toUpperCase()}>${userDetails[key]}</acc:${key.toUpperCase()}> `;
    }
    xmlData += `</acc:ACCOUNT_REQUEST_DETAIL>
    </acc:DSB_BODY>
  </acc:DSB_VALACCOUNT_REQ>
</soapenv:Body>
</soapenv:Envelope>`;
    return xmlData;
  }

  async checkTokenValidity(accountNumber: any) {
    log.info('---accountNumber---');
    log.info(accountNumber);
    let callGatewayOptions = {
      apiName: 'fetchTransaction',
      body: {
        where: {
          AccountNumber: accountNumber,
        },
        order: ['UpdatedAt DESC'],
      },
    };
    return await this.dtbGatewayParams
      .callGateway(callGatewayOptions)
      .then((dtbTransactionInstance: any) => {
        log.info('---dtbTransactionInstance---');
        log.info(dtbTransactionInstance);
        let currentTime = Utils.fetchCurrentTimestamp();
        if (
          currentTime <=
          Utils.addCalculatedTimestamp(
            { timestamp: dtbTransactionInstance.CreatedDate, offset: dtbTransactionInstance.ttl, unit: 'ms' },
          )
        ) {
          return dtbTransactionInstance;
        } else {
          return {};
        }
      })
      .catch((dtbTransactionErr: any) => {
        log.info('---dtbTransactionErr---');
        console.dir(dtbTransactionErr);
      });
  }

  async validateAccountFunction(dtbTransaction: any): Promise<any> {
    try {
      let dtbTransactionReq: any = { ...dtbTransaction.userDetails };
      let paymentPartnerFilter: Filter = {
        where: {
          PartnerCode: dtbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      log.info('---DtbTransaction---');
      log.info(dtbTransactionReq);
      return await this.paymentPartnerRepository
        .findOne(paymentPartnerFilter)
        .then((paymentPartner: any) => {
          log.info('---paymentPartner---');
          log.info(paymentPartner);
          // let accountRequestReq = {
          //   integrationPartner: {
          //     // TODO: Change these fields
          //     SOURCE: paymentPartner.ExternalEndpointSpecs['ValidateAccount'].SOURCE,
          //     XREF: Utils.generateReferenceID(`${dtbTransactionReq.AccountNumber} ${dtbTransactionReq.CountryCode} ${Utils.fetchCurrentTimestamp()}`),
          //     USER_ID: paymentPartner.CollectionAccountNumber,
          //     PASSWORD: paymentPartner.CollectionAccountPassword
          //   },
          //   userDetails: {
          //   }
          // };
          let callRequestObj = {
            apiPath: ApiList['VALIDATE_DTB_ACCOUNT'],
            body: {
              paymentPartner: {
                SOURCE: 'ValidateAccount',
                XREF: Utils.generateReferenceID(
                  dtbTransactionReq.AccountNumber,
                  dtbTransactionReq.CountryCode,
                ),
                USER_ID: paymentPartner.CollectionAccountNumber,
                PASSWORD: paymentPartner.CollectionAccountPassword,
              },
              userDetails: {
                ACCOUNT_NUMBER: dtbTransactionReq.AccountNumber,
              },
            },
          };
          log.info('---callRequestObj---');
          log.info(callRequestObj);
          return Utils.callRequest(callRequestObj);
          // return Promise.resolve({
          //   body: `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          //     <soap:Body>
          //        <dsb:DSB_VALACCOUNT_RES xmlns:dsb="http://dsbflex.dtbafrica.com/accountservice/DSBAccountService/AccountValidation/" xmlns:dsbclient="http://dsbflex.dtbafrica.com/service/DSBFlexCOService/AccountQuery/XMLSchema">
          //           <dsb:DSB_HEADER>
          //              <dsb:SOURCE>CL_AZAMPAY</dsb:SOURCE>
          //              <dsb:XREF>AZAMPAYXREF00000V159</dsb:XREF>
          //              <dsb:USER_ID>AZAMPAYUSR</dsb:USER_ID>
          //              <dsb:PASSWORD>XXXXXXXXXXXXXXXX</dsb:PASSWORD>
          //              <dsb:SERVICE>DSBAccountService</dsb:SERVICE>
          //              <dsb:OPERATION>ValidateAccount</dsb:OPERATION>
          //              <dsb:MESSAGE_STATUS>SUCCESS</dsb:MESSAGE_STATUS>
          //           </dsb:DSB_HEADER>
          //           <dsb:DSB_BODY>
          //              <dsb:ACCOUNT_RESPONSE_DETAIL>
          //                 <dsb:SESSION_TOKEN>5FCDB6A74FB047E98A2E396EF5904208</dsb:SESSION_TOKEN>
          //                 <dsb:OTP_MEDIUM>S</dsb:OTP_MEDIUM>
          //                 <dsb:MEDIUM_DATA>254733****58</dsb:MEDIUM_DATA>
          //              </dsb:ACCOUNT_RESPONSE_DETAIL>
          //           </dsb:DSB_BODY>
          //        </dsb:DSB_VALACCOUNT_RES>
          //     </soap:Body>
          //  </soap:Envelope>`
          // })
        })
        .then(
          (requestPromiseResXml: any): Promise<any> => {
            log.info('---requestPromiseResXml---');
            log.info(requestPromiseResXml);
            // requestPromiseResXml = requestPromiseResXml.body;
            let jsonResp = JSON.parse(
              xml2Json.toJson(requestPromiseResXml).replace(/soap:|dsb:/g, ''),
            );
            if (
              !Utils.findKey({ obj: jsonResp, value: 'Envelope' }) &&
              !Utils.findKey({ obj: jsonResp['Envelope'], value: 'Body' }) &&
              !Utils.findKey({ obj: jsonResp['Envelope']['Body'], value: 'DSB_VALACCOUNT_RES' })
            ) {
              throw {
                success: false,
                statusCode: 500,
                msg:
                  'Error in the received response format for account validation\nPlease try again after some time',
                data: {},
              };
            } else if (Utils.findKey({ obj: jsonResp['Envelope']['Body'], value: 'DSB_ERROR_RESPONSE' })) {
              log.info('---THERE_WAS_AN_ERROR_IN_THE_REQUEST_PROMISE---');
              throw {
                success: false,
                statusCode: jsonResp['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_CODE || 500,
                msg:
                  jsonResp['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_DESC ||
                  'Internal server error,\nPlease try again after some time',
                data: {},
              };
            } else {
              log.info('---key_found---');
              jsonResp = jsonResp['Envelope']['Body']['DSB_VALACCOUNT_RES'];
              let jsonHeader = jsonResp['DSB_HEADER'];
              let jsonBody = jsonResp['DSB_BODY'];
              let operationsLog = [
                {
                  operation: jsonHeader?.OPERATION,
                  timestamp: Utils.fetchCurrentTimestamp(),
                },
              ];
              let createTransactionInstance = {
                ReferenceID: jsonHeader?.XREF,
                SessionToken: jsonBody?.ACCOUNT_RESPONSE_DETAIL?.SESSION_TOKEN,
                AccountNumber: dtbTransactionReq?.userDetails?.accountNumber,
                Source: jsonHeader?.SOURCE,
                Operations: JSON.stringify(operationsLog),
                CountryCode: dtbTransactionReq?.userDetails?.CountryCode,
                Status: 'pending',
              };
              log.info(jsonBody);
              log.info('---createTransactionInstance--');
              log.info(createTransactionInstance);
              const rabbitMqObj = {
                createTransactionInstance,
              };
              dtbRabbitMq.sendToQueue(
                JSON.stringify(rabbitMqObj),
                this.dtbTransactionConstant['queueRoutingKey'],
              );
              return Promise.resolve(createTransactionInstance);
            }
          },
        )
        .then((createDtbInstanceRes: any) => {
          log.info('---createDtbInstanceRes---');
          log.info(createDtbInstanceRes);
          return {
            success: true,
            statusCode: 200,
            msg: 'Transaction successfully started',
            data: {
              ReferenceID: createDtbInstanceRes.ReferenceID,
            },
          };
        })
        .catch((createDtbInstanceErr: any) => {
          log.info('---createDtbInstanceErr---');
          log.info(createDtbInstanceErr);
          return {
            statusCode: createDtbInstanceErr.statusCode || 500,
            msg:
              createDtbInstanceErr.msg ||
              createDtbInstanceErr.message ||
              'Invalid response format while validating the account number\nPlease try again after some time',
            data: {},
          };
        });
    } catch (error) {
      log.error('---validateAccountDetailsFunction_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  generateValidateAuthCodeRequestXml(data: any) {
    log.info('---all i know---');
    // data = {
    //   integrationPartner: {
    //     SOURCE: '',
    //     XREF: '',
    //     USER_ID: '',
    //     PASSWORD: '',
    //     SERVICE: '',
    //     OPERATION: ''
    //   },
    //   userDetails: {
    //     ACCOUNT_NUMBER: '',
    //     OTP: ''
    //   }
    // };
    let xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:acc="http://dsbflex.dtbafrica.com/accountservice/DSBAccountService/AccountValidation/">
    <soapenv:Header/>
    <soapenv:Body>
       <acc:DSB_VALACCOTP_REQ>
          <acc:DSB_HEADER>`;
    let integrationPartner = data.integrationPartner;
    let userDetails = data.userDetails;
    for (const key in integrationPartner) {
      xmlData += ` <acc:${key.toUpperCase()}>${
        integrationPartner[key]
      }<acc:/${key.toUpperCase()}> `;
    }
    xmlData += `<acc:SERVICE>DSBAccountService</acc:SERVICE>
    <acc:OPERATION>ValidateAccount</acc:OPERATION>
 </acc:DSB_HEADER>
 <acc:DSB_BODY>
    <acc:ACCOTP_REQUEST_DETAIL>`;
    for (const key in userDetails) {
      xmlData += ` <acc:${key.toUpperCase()}>${userDetails[key]}</acc:${key.toUpperCase()}> `;
    }
    xmlData += `</acc:ACCOTP_REQUEST_DETAIL>
    </acc:DSB_BODY>
 </acc:DSB_VALACCOTP_REQ>
</soapenv:Body>
</soapenv:Envelope>`;
    log.info('---xmlData---');
    log.info(xmlData);
    return xmlData;
  }

  async validateAuthCodeFunction(dtbTransaction: any): Promise<any> {
    try {
      let dtbTransactionReq: any = { ...dtbTransaction };
      let paymentPartnerFilter: Filter = {
        where: {
          PartnerCode: dtbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      log.info('---dtbTransactionReq---');
      log.info(dtbTransactionReq);
      let [paymentPartnerError, paymentPartnerDetails] = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (paymentPartnerError) {
        log.info('---paymentPartnerError---');
        log.info(paymentPartnerError);
        return {
          success: false,
          statusCode: paymentPartnerError.statusCode || 500,
          msg: paymentPartnerError.message || 'Internal server error',
          data: paymentPartnerError.data || {},
        };
      } else {
        log.info('---paymentPartnerDetails---');
        log.info(paymentPartnerDetails);
        let callGatewayOptions: any = {
          apiName: 'fetchTransaction',
          body: {
            where: {
              ReferenceID: dtbTransactionReq.authCodeDetails?.ReferenceID,
              SessionToken: dtbTransactionReq.authCodeDetails?.sessionToken,
              Active: true,
              Archived: false,
            },
          },
        };
        let [dtbTransactionError, dtbTransactionDetails] = await Utils.executePromise(
          this.dtbGatewayParams.callGateway(callGatewayOptions),
        );
        if (dtbTransactionError) {
          log.info('---dtbTransactionError---');
          log.info(dtbTransactionError);
          return {
            success: false,
            statusCode: 500,
            msg: 'Internal server error',
            data: {},
          };
        } else {
          log.info('---dtbTransactionDetails---');
          log.info(dtbTransactionDetails);
          let authValidateReq = {
            apiPath: ApiList['VALIDATE_DTB_AUTH_CODE'],
            body: {
              paymentVendor: {
                SOURCE: paymentPartnerDetails.ExternalEndpointSpecs['ValidateAuthCode'].SOURCE,
                XREF: dtbTransactionDetails.ReferenceID,
                USER_ID: paymentPartnerDetails.CollectionAccountNumber,
                PASSWORD: paymentPartnerDetails.CollectionAccountPassword,
              },
              userDetails: {
                SESSION_TOKEN: dtbTransactionReq.authCodeDetails?.sessionToken,
                OTP: dtbTransactionReq.authCodeDetails?.otp,
              },
            },
          };
          log.info('---rpObj---');
          log.info(authValidateReq);
          // return await Promise.resolve()
          return await Utils.callRequest(authValidateReq)
            .then(async (rpDetailsXml: any) => {
              // rpDetailsXml = {
              //   body: `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              //     <soap:Body>
              //        <dsb:DSB_VALACCOTP_RES xmlns:dsb="http://dsbflex.dtbafrica.com/accountservice/DSBAccountService/AccountValidation/" xmlns:dsbclient="http://dsbflex.dtbafrica.com/service/DSBFlexCOService/AccountQuery/XMLSchema">
              //           <dsb:DSB_HEADER>
              //              <dsb:SOURCE>CL_AZAMPAY</dsb:SOURCE>
              //              <dsb:XREF>AZAMPAYXREF00000T197</dsb:XREF>
              //              <dsb:USER_ID>AZAMPAYUSR</dsb:USER_ID>
              //              <dsb:PASSWORD>XXXXXXXXXXXXXXXX</dsb:PASSWORD>
              //              <dsb:SERVICE>DSBAccountService</dsb:SERVICE>
              //              <dsb:OPERATION>ValidateAccount</dsb:OPERATION>
              //              <dsb:MESSAGE_STATUS>SUCCESS</dsb:MESSAGE_STATUS>
              //           </dsb:DSB_HEADER>
              //           <dsb:DSB_BODY>
              //              <dsb:ACCOTP_RESPONSE_DETAIL>
              //                 <dsb:ACCOUNT_CODE>DCAC-U9L8CS9RL21P52Z</dsb:ACCOUNT_CODE>
              //                 <dsb:ACCOUNT_NAME>YOGESHGIRI GOSWAMI  -STAFF A/C</dsb:ACCOUNT_NAME>
              //                 <dsb:ACCOUNT_BRANCH>001</dsb:ACCOUNT_BRANCH>
              //                 <dsb:ACCOUNT_CURRENCY>KES</dsb:ACCOUNT_CURRENCY>
              //              </dsb:ACCOTP_RESPONSE_DETAIL>
              //           </dsb:DSB_BODY>
              //        </dsb:DSB_VALACCOTP_RES>
              //     </soap:Body>
              //  </soap:Envelope>`};
              // let rpDetails: any = {
              //   "Envelope": {
              //     "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
              //     "Body": {
              //       "DSB_VALACCOTP_RES": {
              //         "xmlns:dsb": "http://dsbflex.dtbafrica.com/accountservice/DSBAccountService/AccountValidation/",
              //         "xmlns:dsbclient": "http://dsbflex.dtbafrica.com/service/DSBFlexCOService/AccountQuery/XMLSchema",
              //         "DSB_HEADER": {
              //           "SOURCE": "CL_AZAMPAY",
              //           "XREF": "AZAMPAYXREF00000T197",
              //           "USER_ID": "AZAMPAYUSR",
              //           "PASSWORD": "XXXXXXXXXXXXXXXX",
              //           "SERVICE": "DSBAccountService",
              //           "OPERATION": "ValidateAccount",
              //           "MESSAGE_STATUS": "SUCCESS"
              //         },
              //         "DSB_BODY": {
              //           "ACCOTP_RESPONSE_DETAIL": {
              //             "ACCOUNT_CODE": "DCAC-U9L8CS9RL21P52Z",
              //             "ACCOUNT_NAME": "YOGESHGIRI GOSWAMI  -STAFF A/C",
              //             "ACCOUNT_BRANCH": "001",
              //             "ACCOUNT_CURRENCY": "KES"
              //           }
              //         }
              //       }
              //     }
              //   }
              // };
              log.info('---rpDetailsXml---');
              log.info(rpDetailsXml);
              let rpDetails = JSON.parse(
                xml2Json.toJson(rpDetailsXml.body).replace(/soap:|dsb:/g, ''),
              );
              log.info('---rpDetails---');
              log.info(rpDetails);
              if (
                !Utils.findKey({ obj: rpDetails, value: 'Envelope' }) &&
                !Utils.findKey({ obj: rpDetails['Envelope'], value: 'Body' }) &&
                !Utils.findKey({ obj: rpDetails['Envelope']['Body'], value: 'DSB_VALACCOTP_RES' })
              ) {
                log.info('---iNVALID_RESPONSE---');
                return {
                  success: false,
                  statusCode: 500,
                  msg: 'Error in the received response format for account validation',
                  data: {},
                };
              } else if (
                Utils.findKey({ obj: rpDetails, value: 'Envelope' }) &&
                Utils.findKey({ obj: rpDetails['Envelope'], value: 'Body' }) &&
                Utils.findKey({ obj: rpDetails['Envelope']['Body'], value: 'DSB_ERROR_RESPONSE' })
              ) {
                log.info('---ERROR_RESPONSE---');
                return {
                  success: false,
                  statusCode: rpDetails['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_CODE,
                  msg: rpDetails['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_DESC,
                  data: {},
                };
              } else {
                let rpHeaders = rpDetails['Envelope']['Body']['DSB_VALACCOTP_RES']['DSB_HEADER'];
                let rpBody =
                  rpDetails['Envelope']['Body']['DSB_VALACCOTP_RES']['DSB_BODY'][
                    'ACCOTP_RESPONSE_DETAIL'
                  ];
                let updateTransactionInstance = {
                  Status: 'otp-validated',
                  Operations:
                    dtbTransactionDetails.Operations && dtbTransactionDetails.Operations.length
                      ? JSON.stringify(
                          JSON.parse(dtbTransactionDetails.Operations).concat({
                            operation: rpHeaders.OPERATION,
                            ACCOUNT_CODE: rpBody?.ACCOUNT_CODE,
                            ACCOUNT_NAME: rpBody?.ACCOUNT_NAME,
                            ACCOUNT_BRANCH: rpBody?.ACCOUNT_BRANCH,
                            ACCOUNT_CURRENCY: rpBody?.ACCOUNT_CURRENCY,
                            timestamp: Utils.fetchCurrentTimestamp(),
                          }),
                        )
                      : JSON.stringify([
                          {
                            operation: rpHeaders.OPERATION,
                            ACCOUNT_CODE: rpBody?.ACCOUNT_CODE,
                            ACCOUNT_NAME: rpBody?.ACCOUNT_NAME,
                            ACCOUNT_BRANCH: rpBody?.ACCOUNT_BRANCH,
                            ACCOUNT_CURRENCY: rpBody?.ACCOUNT_CURRENCY,
                            timestamp: Utils.fetchCurrentTimestamp(),
                          },
                        ]),
                };
                log.info('---updateTransactionInstance---');
                log.info(updateTransactionInstance);
                // TODO: ADD A PG CALL HERE to update the transaction details
                const rabbitMqObj = {
                  updateTransactionInstance,
                };
                dtbRabbitMq.sendToQueue(
                  JSON.stringify(rabbitMqObj),
                  this.dtbTransactionConstant['queueRoutingKey'],
                );
                return {
                  success: true,
                  statusCode: 200,
                  msg: 'Otp successfully validated',
                  data: {
                    AccountCode: rpBody?.ACCOUNT_CODE,
                    AccountName: rpBody?.ACCOUNT_NAME,
                    AccountBranch: rpBody?.ACCOUNT_BRANCH,
                    AccountCurrency: rpBody?.ACCOUNT_CURRENCY,
                    ReferenceID: dtbTransactionDetails.ReferenceID,
                    Status: dtbTransactionDetails.Status,
                  },
                };
              }
            })
            .catch((rpError: any) => {
              log.info('---rpError---');
              log.info(rpError);
              throw {
                success: false,
                statusCode: 500,
                msg: 'Internal server error',
              };
            });
        }
      }
    } catch (error) {
      log.error('---validateAuthCodeFunction_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  generatePostTransactionRequestXml(data: any) {
    // data = {
    //   integrationPartner: {
    //     SOURCE: '',
    //     XREF: '',
    //     USER_ID: '',
    //     PASSWORD: '',
    //     SERVICE: '',
    //     OPERATION: ''
    //   },
    //   userDetails: {
    //     ACCOUNT_NUMBER: '',
    //     USER_REFERENCE: '',
    //     TRANSACTION_TYPE: '',
    //     DEBIT_ACCOUNT_CODE: '',
    //     CREDIT_ACCOUNT_CODE: '',
    //     TRANSACTION_AMOUNT: '',
    //     VALUE_DATE: '',
    //     TRANSACTION_DATE: '',
    //     REMARKS: ''
    //   }
    // };
    let xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pos="http://dsbflex.dtbafrica.com/ftservice/DSBFTService/PostTransaction/">
    <soapenv:Header/>
    <soapenv:Body>
       <pos:DSB_POSTFT_REQ>
          <pos:DSB_HEADER>`;
    let integrationPartner = data.integrationPartner;
    let userDetails = data.userDetails;
    for (const key in integrationPartner) {
      xmlData += ` <pos:${key.toUpperCase()}>${
        integrationPartner[key]
      }<pos:/${key.toUpperCase()}> `;
    }
    xmlData += `<pos:SERVICE>DSBFTService</pos:SERVICE>
    <pos:OPERATION>PostTransaction</pos:OPERATION>
 </pos:DSB_HEADER>
 <pos:DSB_BODY>
    <pos:FT_REQUEST_DETAIL>`;
    for (const key in userDetails) {
      xmlData += ` <pos:${key.toUpperCase()}>${userDetails[key]}</pos:${key.toUpperCase()}> `;
    }
    xmlData += `</pos:FT_REQUEST_DETAIL>
    </pos:DSB_BODY>
 </pos:DSB_POSTFT_REQ>
</soapenv:Body>
</soapenv:Envelope>`;
    return xmlData;
  }

  async initiateTransactionFunction(dtbTransaction: any): Promise<any> {
    try {
      let dtbTransactionReq: any = { ...dtbTransaction };
      let paymentPartnerFilter: Filter = {
        where: {
          PartnerCode: dtbTransactionReq.PartnerCode,
          Status: STATUS.ACTIVE,
        },
      };
      log.info('---dtbTransactionReq---');
      log.info(dtbTransactionReq);
      let [paymentPartnerError, paymentPartnerDetails] = await Utils.executePromise(
        this.paymentPartnerRepository.findOne(paymentPartnerFilter),
      );
      if (paymentPartnerError) {
        log.info('---paymentPartnerError---');
        log.info(paymentPartnerError);
        return {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---paymentPartnerDetails---');
      log.info(paymentPartnerDetails);
      // TODO: add a pg call to the dtb transactions here
      let callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: dtbTransactionReq.transactionDetails.ReferenceID,
            CountryCode: dtbTransactionReq.transactionDetails.CountryCode,
          },
        },
      };
      let [dtbTransactionErr, dtbTransactionRes] = await Utils.executePromise(
        this.dtbGatewayParams.callGateway(callGatewayOptions),
      );
      if (dtbTransactionErr) {
        log.info('---dtbTransactionErr---');
        log.info(dtbTransactionErr);
        throw {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---dtbTransactionRes---');
      log.info(dtbTransactionRes);
      let postTransactionReq: any = {
        apiPath: ApiList['POST_DTB_TRANSACTION'],
        body: {
          paymentPartner: {
            SOURCE: paymentPartnerDetails.ExternalEndpointSpecs['PostTransaction'].SOURCE,
            XREF: dtbTransactionRes.ReferenceID,
            USER_ID: paymentPartnerDetails.SPID,
            PASSWORD: paymentPartnerDetails.SpPassword,
          },
          userDetails: {
            USER_REFERENCE: dtbTransactionReq.TransactionReferenceID,
            TRANSACTION_TYPE:
              paymentPartnerDetails.ExternalEndpointSpecs['PostTransaction'].TRANSACTION_TYPE,
            DEBIT_ACCOUNT_CODE: dtbTransactionReq.DebitAccountType
              ? dtbTransactionReq.DebitAccountType
              : null,
            CREDIT_ACCOUNT_CODE: dtbTransactionReq.CreditAccountType
              ? dtbTransactionReq.CreditAccountType
              : null,
            TRANSACTION_AMOUNT: dtbTransactionReq.TransactionAmount,
            REMARKS: dtbTransactionReq.Remarks,
            TRANSACTION_DATE: Utils.fetchCurrentTimestamp(),
          },
        },
      };
      if (dtbTransactionReq?.ChargeAmounts?.length) {
        postTransactionReq.userDetails.ChargeAmounts = dtbTransactionReq.ChargeAmounts;
      }
      log.info('---postTransactionReq---');
      log.info(postTransactionReq);
      let [rpError, rpDetailsXml] = await Utils.executePromise(
        Utils.callRequest(postTransactionReq),
      );
      if (rpError) {
        log.info('---rpError---');
        log.info(rpError);
        return {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---rpDetailsXml---');
      log.info(rpDetailsXml);
      let rpBodyJson: any = JSON.parse(
        xml2Json.toJson(rpDetailsXml.body).replace(/soap:|dsb:/g, ''),
      );
      log.info('---rpBodyJson---');
      log.info(rpBodyJson);
      if (
        !Utils.findKey({ obj: rpBodyJson, value: 'Envelope' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope'], value: 'Body' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope']['Body'], value: 'DSB_POSTFT_RES' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope']['Body']['DSB_POSTFT_RES'], value: 'DSB_HEADER' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope']['Body']['DSB_POSTFT_RES'], value: 'DSB_BODY' })
      ) {
        log.info('---iNVALID_RESPONSE---');
        return {
          success: false,
          statusCode: 500,
          msg:
            'Error in the received response format for account validation,\nPlease try again after some time',
          data: {},
        };
      } else if (
        Utils.findKey({ obj: rpBodyJson, value: 'Envelope' }) &&
        Utils.findKey({ obj: rpBodyJson['Envelope'], value: 'Body' }) &&
        Utils.findKey({ obj: rpBodyJson['Envelope']['Body'], value: 'DSB_ERROR_RESPONSE' })
      ) {
        log.info('---ERROR_RESPONSE---');
        return {
          success: false,
          statusCode: rpBodyJson['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_CODE || 500,
          msg:
            rpBodyJson['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_DESC ||
            'Internal server error,\nPlease try again after some time',
          data: {},
        };
      } else {
        let rpHeaders = rpBodyJson['Envelope']['Body']['DSB_POSTFT_RES'].DSB_HEADER;
        let rpBody = rpBodyJson['Envelope']['Body']['DSB_POSTFT_RES'].DSB_BODY;
        let updateTransactionInstance = {
          Status: 'transaction-initiated',
          Operations:
            dtbTransactionRes.Operations && dtbTransactionRes.Operations.length
              ? JSON.stringify(
                  JSON.parse(dtbTransactionRes.Operations).concat({
                    ...postTransactionReq.userDetails,
                    operation: rpHeaders.OPERATION,
                    Status: 'transaction-initiated',
                    ResponseDetails: rpBody['FT_RESPONSE_DETAIL'],
                  }),
                )
              : JSON.stringify([
                  {
                    ...postTransactionReq.userDetails,
                    ExternalReferenceID: rpBody['FT_RESPONSE_DETAIL'].CBS_REFERENCE,
                    ExternalStatus: rpBody['FT_RESPONSE_DETAIL'].CBS_DESCRIPTION,
                    operation: rpHeaders.OPERATION,
                    Status: 'transaction-initiated',
                    ResponseDetails: rpBody['FT_RESPONSE_DETAIL'],
                  },
                ]),
        };
        log.info('---updateTransactionInstance---');
        log.info(updateTransactionInstance);
        const rabbitMqObj = {
          updateTransactionInstance,
        };
        // TODO: call the pg for updating the transaction
        dtbRabbitMq.sendToQueue(
          JSON.stringify(rabbitMqObj),
          this.dtbTransactionConstant['queueRoutingKey'],
        );
        return {
          success: true,
          statusCode: 200,
          msg: rpBody['FT_RESPONSE_DETAIL'].CBS_DESCRIPTION || 'Transaction has been initiated',
          data: {},
        };
      }
    } catch (error) {
      log.error('---initiateTransactionFunction_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }

  generateQueryTransactionRequestXml(data: any) {
    // data = {
    //   integrationPartner: {
    //     SOURCE: '',
    //     XREF: '',
    //     USER_ID: '',
    //     PASSWORD: '',
    //     SERVICE: '',
    //     OPERATION: ''
    //   },
    //   userDetails: {
    //     USER_REFERENCE: ''
    //   }
    // };
    let xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:quer="http://dsbflex.dtbafrica.com/ftservice/DSBFTService/QueryTransaction/">
    <soapenv:Header/>
    <soapenv:Body>
       <quer:DSB_QUERYFT_REQ>
          <quer:DSB_HEADER>`;
    let integrationPartner = data.integrationPartner;
    let userDetails = data.userDetails;
    for (const key in integrationPartner) {
      xmlData += ` <quer:${key.toUpperCase()}>${
        integrationPartner[key]
      }<quer:/${key.toUpperCase()}> `;
    }
    xmlData += `<quer:SERVICE>DSBFTService</quer:SERVICE>
    <quer:OPERATION>QueryTransaction</quer:OPERATION>
 </quer:DSB_HEADER>
 <quer:DSB_BODY>
    <quer:FT_REQUEST_DETAIL>`;
    for (const key in userDetails) {
      xmlData += ` <quer:${key.toUpperCase()}>${userDetails[key]}</quer:${key.toUpperCase()}> `;
    }
    xmlData += `</quer:FT_REQUEST_DETAIL>
    </quer:DSB_BODY>
 </quer:DSB_QUERYFT_REQ>
</soapenv:Body>
</soapenv:Envelope>`;
    return xmlData;
  }

  async checkTransactionStatusFunction(dtbTransaction: any): Promise<any> {
    try {
      interface callRequestInterface {
        method: string;
        url: string;
        headers: object;
        body: object | string;
        json: boolean;
      }
      let dtbTransactionReq: any = { ...dtbTransaction };
      let paymentVendorFilter: Filter = {
        where: {
          VendorCode: dtbTransactionReq.VendorCode,
          Status: STATUS.ACTIVE,
        },
      };
      log.info('---dtbTransactionReq---');
      log.info(dtbTransactionReq);
      let [integrationPartnerError, integrationPartnerDetails] = await Utils.executePromise(
        this.paymentVendorRepository.findOne(paymentVendorFilter),
      );
      if (integrationPartnerError) {
        log.info('---integrationPartnerError---');
        log.info(integrationPartnerError);
        throw {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---integrationPartnerDetails---');
      log.info(integrationPartnerDetails);
      // TODO: call pg to retreive this info
      let callGatewayOptions: any = {
        apiName: 'fetchTransaction',
        body: {
          where: {
            ReferenceID: dtbTransactionReq.transactionDetails?.ReferenceID,
            CountryCode: dtbTransactionReq.transactionDetails?.CountryCode,
          },
        },
      };
      let [dtbTransactionErr, dtbTransactionRes] = await Utils.executePromise(
        this.dtbGatewayParams.callGateway(callGatewayOptions),
      );
      if (dtbTransactionErr) {
        log.info('---dtbTransactionErr---');
        log.info(dtbTransactionErr);
        throw {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---dtbTransactionRes---');
      log.info(dtbTransactionRes);

      let rpObj: callRequestInterface = {
        method: integrationPartnerDetails.ExternalEndpointSpecs['checkTransactionStatus'].METHOD,
        url: integrationPartnerDetails.ExternalEndpointSpecs['checkTransactionStatus'].URL,
        headers: integrationPartnerDetails.ExternalEndpointSpecs['checkTransactionStatus'].HEADERS,
        body: this.generatePostTransactionRequestXml({}),
        json: false,
      };
      let [rpError, rpDetailsXml]: any = await Utils.executePromise(Utils.callRequest(rpObj));
      if (rpError) {
        log.info('---rpError---');
        log.info(rpError);
        return {
          success: false,
          statusCode: 500,
          msg: 'Internal server error',
          data: {},
        };
      }
      log.info('---rpDetailsXml---');
      log.info(rpDetailsXml);
      let rpBodyJson: any = JSON.parse(
        xml2Json.toJson(rpDetailsXml.body).replace(/soap:|dsb:/g, ''),
      );
      if (
        !Utils.findKey({ obj: rpBodyJson, value: 'Envelope' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope'], value: 'Body' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope']['Body'], value: 'DSB_QUERYFT_RES' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope']['Body']['DSB_QUERYFT_RES'], value: 'DSB_HEADER' }) &&
        !Utils.findKey({ obj: rpBodyJson['Envelope']['Body']['DSB_QUERYFT_RES'], value: 'DSB_BODY' })
      ) {
        log.info('---iNVALID_RESPONSE---');
        return {
          success: false,
          statusCode: 500,
          msg:
            'Error in the received response format for account validation,\nPlease try again after some time',
          data: {},
        };
      } else if (
        Utils.findKey({ obj: rpBodyJson, value: 'Envelope' }) &&
        Utils.findKey({ obj: rpBodyJson['Envelope'], value: 'Body' }) &&
        Utils.findKey({ obj: rpBodyJson['Envelope']['Body'], value: 'DSB_ERROR_RESPONSE' })
      ) {
        log.info('---ERROR_RESPONSE---');
        return {
          success: false,
          statusCode: rpBodyJson['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_CODE || 500,
          msg:
            rpBodyJson['Envelope']['Body']['DSB_ERROR_RESPONSE'].ERROR_DESC ||
            'Internal server error,\nPlease try again after some time',
          data: {},
        };
      } else {
        log.info('---SUCCESSFULLY_RECEIVED_THE_TRANSACTION---');
        let rpBody = rpBodyJson['Envelope']['Body']['DSB_QUERYFT_RES'].DSB_BODY;
        return {
          success: true,
          statusCode: 200,
          msg: rpBody['FT_RESPONSE_DETAIL'].CBS_DESCRIPTION || 'Transaction is in process',
          data: {},
        };
      }
    } catch (error) {
      log.error('---checkTransactionStatusFunction_CATCH_ERROR---');
      log.error(error);
      return {
        success: error.success || false,
        statusCode: error.statusCode || 500,
        msg: error.msg || 'Internal server error',
        data: error.data || {},
      };
    }
  }
}
