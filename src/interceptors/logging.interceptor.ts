/* eslint-disable no-invalid-this */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, format, transports } from 'winston';
import { Utils } from '../common';

export class LoggingInterceptor {
  static apiHash: string;
  constructor(serviceName: any, initApiHash?: string) {
    this.newLog = {
      info: this.generateLogger(serviceName, 'info'),
      error: this.generateLogger(serviceName, 'error'),
      trace: this.generateLogger(serviceName, 'trace'),
      debug: this.generateLogger(serviceName, 'debug'),
      warning: this.generateLogger(serviceName, 'warning'),
    };
    if (initApiHash)
      LoggingInterceptor.apiHash = initApiHash
        .split('-')
        .splice(1, initApiHash.length - 2)
        .join('-');
  }
  private newLog: any;
  private serviceName: any;
  private constructLog(level: string) {
    const levelName: any = level ? level : 'info';
    return (...args: any) => {
      try {
        this.newLog[levelName].log({
          apiHash: LoggingInterceptor.apiHash,
          service: this.serviceName,
          level: levelName,
          message: levelName != 'error' ? args : args.toString() || JSON.stringify(args),
          timestamp: Utils.fetchCurrentTimestamp(),
        });
      } catch (e) {
        console.log('ERROR_IN_LOGS: ');
        console.dir(JSON.stringify(e));
      }
    };
  }
  private generateLogger(serviceName: any, level: string) {
    const levelName = level ? level : 'info';
    const generateLogObj = {
      defaultMeta: {
        service: serviceName || 'azam-integration',
      },
      level: levelName,
      transports: [
        new transports.Console({
          level: levelName,
          format: format.combine(
            format.timestamp({
              format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.errors({
              stack: true,
            }),
            format.splat(),
            format.json(),
          ),
        }),
      ],
    };
    return createLogger(generateLogObj);
  }
  public info = this.constructLog('info');
  public error = this.constructLog('error');
  public trace = this.constructLog('trace');
  public debug = this.constructLog('debug');
  public warning = this.constructLog('warning');
}
