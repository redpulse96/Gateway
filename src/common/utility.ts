/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CryptoJs, cryptoNative, fs, md5, moment, nodemailer, rp, sha1, sha256 } from '.';
import {
  DateTimeFormats,
  ENV,
  HASH_SCHEME,
  InterfaceList,
  NODE_ENV,
  ResponseMappings,
  SmtpDetails,
  STATUS,
  Urls,
} from '../constants';
import { ExternalServiceLogsController } from '../controllers';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';

const { DayFormat, DateFormat, TimstampFormat, MonthFormat, WeekFormat } = DateTimeFormats;
const { DEV, PROD, TEST } = ENV;
const { Name, Password, Username } = SmtpDetails;
const log = new LoggingInterceptor('utils');

export class Utils {
  static ApiOptions: any[];
  static ResponseMessages: any[];
  static NotificationServices: any[];
  static ExternalServices: any[];
  static externalServiceLogsController: ExternalServiceLogsController;

  static isEmpty(obj: object): boolean {
    return !!(Object.keys(obj).length == 0);
  }
  static fetchCurrentTimestamp(): string {
    return moment().format(TimstampFormat);
  }
  static fetchFormattedTimestamp({
    timestamp = Utils.fetchCurrentTimestamp(),
    format = TimstampFormat,
  }: { timestamp?: string; format?: string } = {}): string {
    return moment(timestamp).format(format);
  }
  static addCalculatedTimestamp({
    timestamp,
    offset,
    unit,
  }: {
    timestamp: string;
    offset: number;
    unit: any;
  }): string {
    return moment(timestamp).add(offset, unit).format(TimstampFormat);
  }
  static subtractCalculatedTimestamp({
    timestamp,
    offset,
    unit,
  }: {
    timestamp: string;
    offset: number;
    unit: any;
  }): string {
    return moment(timestamp).subtract(offset, unit).format(TimstampFormat);
  }

  static setLoadedOptions(loadingConfigs: InterfaceList.LoadingConfigs) {
    new Urls();
    Utils.ApiOptions = loadingConfigs.apiConfigs;
    Utils.ResponseMessages = loadingConfigs.responseMessages;
    Utils.NotificationServices = loadingConfigs.notificationServices;
    Utils.externalServiceLogsController = loadingConfigs.externalServiceLogsController;
    Utils.ExternalServices = loadingConfigs.externalServices;
    return loadingConfigs;
  }

  static fetchEnvBasedFilename(filename: string): string {
    const matchedString: RegExpMatchArray | null = filename.match(/\.datasource/g);
    if (matchedString?.length) {
      switch (NODE_ENV) {
        case PROD:
          return filename.replace(matchedString[0], `.${PROD}${matchedString[0]}`);

        case DEV:
          return filename.replace(matchedString[0], `.${DEV}${matchedString[0]}`);

        case TEST:
          return filename.replace(matchedString[0], `.${TEST}${matchedString[0]}`);

        default:
          return filename.replace(matchedString[0], `${matchedString[0]}`);
      }
    }
    return filename;
  }

  static groupByFunction({ inputArr, groupByKey }: { inputArr: any; groupByKey: string }): any {
    const responseObj: any = {};
    inputArr.forEach((val: any) => {
      if (val.hasOwnProperty(groupByKey) && val[groupByKey]) {
        responseObj[val[groupByKey]]?.length
          ? responseObj[val[groupByKey]].push(val)
          : (responseObj[val[groupByKey]] = [val]);
      }
    });
    return responseObj;
  }

  static fetchSkipFilter({ skip, limit }: { skip: number; limit: number }): number {
    return (skip - 1) * limit ? (skip - 1) * limit : 0;
  }

  static createMailerTransport(): any {
    return nodemailer.createTransport({
      service: Name,
      auth: {
        user: Username,
        pass: Password,
      },
    });
  }

  static hashBasedEncryption(encType: string, ...arr: any): string {
    switch (encType.toUpperCase()) {
      case HASH_SCHEME.MD5:
        return md5(arr.join('')).toString();

      case HASH_SCHEME.SHA256:
        return sha256(arr.join('')).toString();

      case HASH_SCHEME.SHA1:
        return sha1(arr.join('')).toString();

      default:
        return md5(arr.join('')).toString();
    }
  }

  static encryptData(data: InterfaceList.CryptoEncryption): any {
    return CryptoJs.AES.encrypt(data.EncyrptionString, data.SecretKey).toString();
  }

  static decryptData(data: InterfaceList.CryptoEncryption): string {
    return CryptoJs.AES.decrypt(data.EncyrptionString, data.SecretKey).toString(CryptoJs.enc.Utf8);
  }

  static hashMessages(data: InterfaceList.HasingMessages) {
    return cryptoNative.pbkdf2(
      data.message,
      data.salt,
      data.iterations,
      data.keylength,
      data.digest,
      (err: any, derivedKey: any) => {
        if (err) throw err;
        return derivedKey.toString('hex');
      },
    );
  }

  static generateRandomNumber({ min, max }: { min: number; max: number }): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  static generateReferenceID(...data: any): string {
    data.push(Utils.fetchCurrentTimestamp());
    const encryptedString: string = md5(data.join('')).toString();
    const encryptedArray: any[] = [];
    const rand: number = this.generateRandomNumber({ min: 1, max: 10 });

    for (let i: number = rand; i < rand + 10; i++) {
      encryptedArray.push(encryptedString[i].toUpperCase());
    }
    return encryptedArray.join('');
  }

  static generateChecksum(...data: any): string {
    return sha256(data.join('')).toString();
  }

  static fetchTimestampFilter(query: any): any {
    switch ('true') {
      case (!!(query?.StartDate && query?.EndDate)).toString():
        return {
          CreatedAt: {
            between: [
              Utils.fetchFormattedTimestamp({ timestamp: query.StartDate, format: DateFormat }),
              Utils.fetchFormattedTimestamp({
                timestamp: Utils.addCalculatedTimestamp({
                  timestamp: query.EndDate,
                  offset: 1,
                  unit: DayFormat,
                }),
                format: DateFormat,
              }),
            ],
          },
        };

      case (!!query?.StartDate).toString():
        return {
          CreatedAt: {
            between: [
              Utils.fetchFormattedTimestamp({ timestamp: query.StartDate, format: DateFormat }),
              Utils.fetchFormattedTimestamp({
                timestamp: Utils.fetchCurrentTimestamp(),
                format: DateFormat,
              }),
            ],
          },
        };

      case (!!query?.EndDate).toString():
        return {
          CreatedAt: {
            between: [
              Utils.fetchFormattedTimestamp({
                timestamp: Utils.fetchCurrentTimestamp(),
                format: DateFormat,
              }),
              Utils.fetchFormattedTimestamp({ timestamp: query.EndDate, format: DateFormat }),
            ],
          },
        };

      default:
        return {
          CreatedAt: {
            between: [
              Utils.fetchFormattedTimestamp({
                timestamp: Utils.subtractCalculatedTimestamp({
                  timestamp: Utils.fetchCurrentTimestamp(),
                  offset: 20,
                  unit: DayFormat,
                }),
                format: DateFormat,
              }),
              Utils.fetchFormattedTimestamp({
                timestamp: Utils.fetchCurrentTimestamp(),
                format: DateFormat,
              }),
            ],
          },
        };
    }
  }

  static findKey({
    obj,
    value,
  }: {
    obj: { [x: string]: any; hasOwnProperty: (arg0: string) => any };
    value: string;
  }) {
    let key = null;
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (prop === value) {
          key = prop;
        }
      }
    }
    return key;
  }

  static processBodyFunction({
    type,
    body,
    options,
  }: {
    type: string;
    body: string;
    options: object;
  }) {
    switch (type) {
      case 'object':
        return body ? JSON.parse(eval(body)) : options;
      case 'string':
        return body ? eval(body) : options;
      case 'form':
        return body ? JSON.parse(eval(body)) : options;
      default:
        return {};
    }
  }

  static catchReturn(error: any): any {
    log.error('---UTILS.CATCH.ERROR---', error);
    return { messageCode: ResponseMappings['INTERNAL_SERVICE_UNAVAILABLE'] };
  }

  static async executePromise(promise: Promise<any>) {
    try {
      const resp = await promise;
      return [null, resp];
    } catch (error) {
      return [error, null];
    }
  }

  static async callRequest(options: any): Promise<any> {
    try {
      const apiParam = Utils.ExternalServices.find((val: any) => {
        return val.ServiceName == options.apiPath;
      });
      log.info('---apiParam---');
      if (apiParam?.ExternalServiceID) {
        const requestOptions: any = {
          url: apiParam['ApiRequestOptions'].URL ? apiParam['ApiRequestOptions'].URL : undefined,
          method: apiParam['ApiRequestOptions'].METHOD
            ? apiParam['ApiRequestOptions'].METHOD
            : undefined,
          headers: options.headers ? options.headers : apiParam['ApiRequestOptions'].HEADERS,
          body: options.body
            ? this.processBodyFunction({
                type: apiParam.ApiRequestType,
                body: apiParam.ApiRequest,
                options: options.body,
              })
            : undefined,
          form: options.form
            ? this.processBodyFunction({
                type: apiParam.ApiRequestType,
                body: apiParam.ApiRequest,
                options: options.form,
              })
            : undefined,
          qs: apiParam['ApiRequestOptions'].QS ? apiParam['ApiRequestOptions'].QS : undefined,
          rejectUnauthorized:
            false || !apiParam['ApiRequestOptions'].REJECT_UNAUTHORIZED
              ? apiParam['ApiRequestOptions'].REJECT_UNAUTHORIZED
              : false,
          insecure: !apiParam['ApiRequestOptions'].INSECURE
            ? apiParam['ApiRequestOptions'].INSECURE
            : undefined,
          agentOptions: apiParam['ApiRequestOptions'].AGENT_OPTIONS
            ? apiParam['ApiRequestOptions'].AGENT_OPTIONS
            : undefined,
          json: apiParam.ApiRequestType === 'object' ? true : false,
        };
        if (requestOptions?.agentOptions?.CERT) {
          requestOptions.agentOptions.cert = fs.readFileSync(requestOptions.agentOptions.CERT);
          delete requestOptions.agentOptions.CERT;
        }
        if (requestOptions?.agentOptions?.KEY) {
          requestOptions.agentOptions.key = fs.readFileSync(requestOptions.agentOptions.KEY);
          delete requestOptions.agentOptions.KEY;
        }
        if (requestOptions?.agentOptions?.PASS_PHRASE) {
          requestOptions.agentOptions.passphrase = requestOptions.agentOptions.PASS_PHRASE;
          delete requestOptions.agentOptions.PASS_PHRASE;
        }
        return rp(requestOptions)
          .then((response: any) => {
            log.info('---callRequest.then---');
            const createExternalServiceLogs: any = {
              ExternalServicePath: requestOptions.url,
              ExternalServiceHeaders: requestOptions.headers,
              ExternalServiceBody: requestOptions?.body || requestOptions?.form,
              ExternalServiceResponse: response,
              ExternalServiceResponseCode: response.statusCode ? response.statusCode : 200,
              Status: response ? STATUS.SUCCESS : STATUS.FAILURE,
            };
            Utils.externalServiceLogsController.create(createExternalServiceLogs);
            if (response) {
              return {
                success: response.success || true,
                message: 'Response retrieved successfully',
                requestBody: requestOptions.body,
                responseBody: response,
                data: response,
              };
            } else {
              return {
                success: false,
                message: 'Something went wrong. No data found',
                requestBody: requestOptions.body,
                responseBody: null,
                data: {},
              };
            }
          })
          .catch((err: any) => {
            log.error('---callRequest.catch---', err);
            const createExternalServiceLogs: any = {
              ExternalServicePath: options?.url,
              ExternalServiceHeaders: options?.headers,
              ExternalServiceBody: options?.body,
              ExternalServiceResponse: err,
              ExternalServiceResponseCode: err?.statusCode ? err.statusCode : 500,
            };
            Utils.externalServiceLogsController.create(createExternalServiceLogs);
            return {
              success: false,
              message: 'Something went wrong while requesting',
              requestBody: requestOptions.body,
              responseBody: err,
              data: err,
            };
          });
      } else if (options.url) {
        return rp(options)
          .then((res: any) => {
            log.info('---rp.res---');
            const createExternalServiceLogs: any = {
              ExternalServicePath: options.url,
              ExternalServiceHeaders: options.headers,
              ExternalServiceBody: options?.body || options?.form || {},
              ExternalServiceResponse: res,
              ExternalServiceResponseCode: res.statusCode ? res.statusCode : 200,
              Status: res ? STATUS.SUCCESS : STATUS.FAILURE,
            };
            Utils.externalServiceLogsController.create(createExternalServiceLogs);
            return {
              success: true,
              message: 'Transaction successfully executed',
              requestBody: options,
              responseBody: res,
              data: res,
            };
          })
          .catch((err: any) => {
            log.error('---rp.err---', err);
            const createExternalServiceLogs: any = {
              ExternalServicePath: options?.url,
              ExternalServiceHeaders: options?.headers || {},
              ExternalServiceBody: options?.body || {},
              ExternalServiceResponse: err,
              ExternalServiceResponseCode: err?.statusCode ? err.statusCode : 500,
            };
            Utils.externalServiceLogsController.create(createExternalServiceLogs);
            return {
              success: false,
              message: 'Something went wrong while requesting',
              requestBody: options,
              responseBody: err,
              data: err,
            };
          });
      } else {
      }
    } catch (error) {
      log.error('---callRequest.catch.error---', error);
      return {
        success: false,
        statusCode: 500,
        msg: 'Internal server error',
        requestBody: options,
        responseBody: error,
        data: {},
      };
    }
  }

  static fetchPreviousWeekRange(): [string, string] {
    const startDate: string = moment(Utils.fetchCurrentTimestamp())
      .subtract(1, WeekFormat)
      .startOf(WeekFormat)
      .format(DateFormat);
    const endDate: string = moment(Utils.fetchCurrentTimestamp())
      .subtract(1, WeekFormat)
      .endOf(WeekFormat)
      .format(DateFormat);
    return [startDate, endDate];
  }

  static fetchPreviousMonthRange(): [string, string] {
    const startDate: string = moment(Utils.fetchCurrentTimestamp())
      .subtract(1, MonthFormat)
      .startOf(MonthFormat)
      .format(DateFormat);
    const endDate: string = moment(Utils.fetchCurrentTimestamp())
      .subtract(1, MonthFormat)
      .endOf(MonthFormat)
      .format(DateFormat);
    return [startDate, endDate];
  }

  static returnDisplayingMsisdn(msisdn: string): string | null {
    if (!msisdn) return null;
    let returnedMsisdn: string = msisdn;
    msisdn.match(/^255.*/g)?.length ? (returnedMsisdn = msisdn) : (returnedMsisdn = `255${msisdn}`);
    return returnedMsisdn.toString();
  }
}
