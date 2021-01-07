/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AuthenticateFn,
  AuthenticationBindings,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  FindRoute,
  inject,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  repository,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
  USER_PROFILE_NOT_FOUND,
  Utils,
} from './common';
import { STATUS } from './constants';
import { AuditLogsController } from './controllers';
import { LoggingInterceptor } from './interceptors';
import { IntegrationLogsRepository } from './repositories';
const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(SequenceActions.INVOKE_MIDDLEWARE, { optional: true })
    protected invokeMiddleware: InvokeMiddleware = () => false,
    @inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn,
    @inject(`controllers.AuditLogsController`)
    private auditLogsController: AuditLogsController,
    @repository(IntegrationLogsRepository)
    public integrationLogsRepository: IntegrationLogsRepository,
  ) {}

  async handle(context: RequestContext): Promise<any> {
    try {
      const { request, response }: any = context;
      const finished = await this.invokeMiddleware(context);
      if (finished) return;

      const { headers } = request;
      const log = new LoggingInterceptor('sequence', context.name);
      const route = this.findRoute(request);
      // call authenticateFn
      const auth: any = await this.authenticateRequest(request);
      if (auth && !auth?.success) {
        response.setHeader('Content-Type', headers['content-type'] || 'application/json');
        const returnResponse: any = Utils.ResponseMessages?.find(
          (val: any) => val.MessageCode == auth.messageCode,
        );
        if (returnResponse) {
          log.info('---returnResponse---');
          returnResponse.statusCode = returnResponse?.StatusCode ? returnResponse?.StatusCode : 200;
          response.status(returnResponse.statusCode);
          return response.send({
            success: returnResponse?.Success,
            message: returnResponse?.Message,
            statusCode: returnResponse.statusCode,
            responseCode: returnResponse.ResponseCode,
            data: { ...returnResponse.ResponseData },
          });
        } else {
          return response.send({
            success: false,
            statusCode: 500,
            responseCode: 500,
            message: 'Internal server error',
            data: {},
          });
        }
      }

      const args = await this.parseParams(request, route);
      const integrationLogInstance: any = {
        ApiHash: context.name
          .split('-')
          .splice(1, context.name.length - 2)
          .join('-'),
        RedirectFrom: `${request.hostname}${request.path}`,
        ApiHeaders: request.headers,
        Apibody: request?.body || {},
        Status: STATUS.ACTIVE,
      };
      // TODO: before remote method
      log.info(`<----------API_PATH-------->`);
      log.info(request.path);
      log.info(`<----------API_METHOD---------->`);
      log.info(request.method);
      log.info(`<----------API_HEADERS---------->`);
      log.info(JSON.parse(JSON.stringify(request.headers)));
      log.info(`<--------API_PAYLOAD-------->`);
      log.info(args);
      log.info(`<--------START_API_PROCESS--::--${request.hostname}${request.path}-------->`);
      if (request.method == 'OPTIONS') {
        return {
          success: true,
          statusCode: 200,
          responseCode: 200,
          message: 'Request accepted',
          data: {},
        };
      }
      const result: any = await this.invoke(route, args);
      // TODO: after remote method
      integrationLogInstance.ApiResponseCode = 200;
      integrationLogInstance.ApiResponse = result;
      response.status(200);
      if (result?.statusCode) {
        response.status(result.statusCode);
        integrationLogInstance.ApiResponseCode = result.statusCode;
        delete result['statusCode'];
      }
      result?.messageCode && delete result['messageCode'];
      log.info(`<--------END_API_PROCESS--::--${request.hostname}${request.path}-------->`);
      this.integrationLogsRepository.create(integrationLogInstance);
      if (request?.user?.auditLogs.Path) {
        const auditLog: any = {
          ...request?.user?.auditLogs,
          Email: request?.user?.auditLogs.Email || request?.body?.Email,
          ApiHeaders: request.headers,
          Apibody: request.body || request.query || {},
          ApiResponse: result,
        };
        this.auditLogsController.create(auditLog);
      }
      response.setHeader('Content-Type', headers['content-type'] || 'application/json');
      return response.send(result);
    } catch (error) {
      console.log('---sequence_error---');
      console.dir(error);
      if (
        error.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        error.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error, {
          success: false,
          statusCode: 401 /* Unauthorized */,
          responseCode: 204,
          data: {},
        });
      }
      return this.reject(context, error);
    }
  }
}
