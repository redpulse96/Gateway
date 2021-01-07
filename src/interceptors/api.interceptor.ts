/* eslint-disable no-invalid-this */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import {
  globalInterceptor,
  inject,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  repository,
  Request,
  RestBindings,
  Utils,
  ValueOrPromise,
  xml2Json,
} from '../common';
import { STATUS } from '../constants';
import { ApiConfigurationsController } from '../controllers';
import { ApiConfigurationsRepository } from '../repositories';
import { LoggingInterceptor } from './logging.interceptor';

const log = new LoggingInterceptor('api.Interceptor');
/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@globalInterceptor('Api', { tags: { name: 'Api' } })
export class ApiInterceptor implements Provider<Interceptor> {
  constructor(
    @repository(ApiConfigurationsRepository)
    private apiConfigurationsRepository: ApiConfigurationsRepository,

    @inject(RestBindings.Http.REQUEST)
    private request: Request,
  ) {}
  private apiConfigurationsController: ApiConfigurationsController = new ApiConfigurationsController(
    this.apiConfigurationsRepository,
  );
  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  async value() {
    return this.intercept.bind(this);
  }

  returnValidatedRequest(body: any, requestOptions: any): object {
    if (requestOptions['replacement_fields']) {
      let tempBody = JSON.stringify(body);
      for (const key in requestOptions['replacement_fields']) {
        const regexKey = new RegExp(key, 'g');
        tempBody = tempBody.replace(regexKey, requestOptions['replacement_fields'][key]);
      }
      body = JSON.parse(tempBody);
    }
    return body;
  }

  returnValidatedResponse(type: any, response: any, responseOptions: any) {
    switch (type) {
      case 'object':
        const returnResponse: any = Utils.ResponseMessages?.find(
          (val: any) => val.MessageCode == response.messageCode,
        );
        if (returnResponse) {
          log.info('---returnResponse---');
          returnResponse.statusCode = returnResponse.StatusCode || response.statusCode;
          return {
            success: response.success || returnResponse.Success,
            message: response.message || returnResponse.Message,
            statusCode: returnResponse.StatusCode || response.statusCode,
            responseCode: returnResponse.ResponseCode || response.responseCode,
            data: {
              ...returnResponse.ResponseData,
              ...response.data,
            },
          };
        } else {
          return {
            success: response.success || false,
            statusCode: response.statusCode || 200,
            responseCode: 201,
            message: response.msg || response.message || 'Transaction successfully executed',
            data: response.data || {},
          };
        }

      case 'string':
        log.info('response', response);
        log.info('responseOptions', responseOptions);
        if (
          response &&
          response['responseType'] &&
          (responseOptions?.error_response || responseOptions?.success_response)
        ) {
          switch (response['responseType']) {
            case 'error_response':
              return Utils.processBodyFunction({
                type,
                body: responseOptions['error_response'],
                options: response,
              });
            case 'success_response':
              return Utils.processBodyFunction({
                type,
                body: responseOptions['success_response'],
                options: response,
              });
            default:
              return response;
          }
        }
        return response;

      default:
        return {
          success: true,
          responseCode: 200,
          statusCode: 200,
          message: 'Successfully fetched',
          data: {},
          ...response,
        };
    }
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(invocationCtx: InvocationContext, next: () => ValueOrPromise<InvocationResult>) {
    try {
      // Add pre-invocation logic here
      const { body, path } = this.request;
      const filter = {
        where: {
          ApiPath: path,
          ApiType: STATUS.INCOMING,
          Status: STATUS.ACTIVE,
        },
      };
      const apiDetails = await this.apiConfigurationsController.fetchApiConfiguration(filter);
      if (apiDetails?.ApiConfigurationID && !apiDetails?.SkipValidation) {
        apiDetails.ApiResponseOptions = {
          error_response: apiDetails.ApiErrorResponse,
          success_response: apiDetails.ApiSuccessResponse,
        };
        let apiRequest: any = eval(apiDetails?.ApiRequest);
        if (apiRequest) {
          switch (apiDetails?.ApiRequestType) {
            case 'string':
              if (typeof body !== 'string') {
                return {
                  success: false,
                  statusCode: 415,
                  msg: 'Unsupported media type',
                  data: {},
                };
              }
              if (apiDetails?.ApiRequestOptions) {
                apiRequest = JSON.parse(xml2Json.toJson(body.replace(/\\n|\\/gm, '')));
                this.request.body = this.returnValidatedRequest(
                  apiRequest,
                  apiDetails.ApiRequestOptions,
                );
              }
              break;
            case 'object':
              // apiRequest = JSON.parse(apiRequest);
              if (typeof body !== 'object') {
                return {
                  success: false,
                  statusCode: 415,
                  msg: 'Unsupported media type',
                  data: {},
                };
              } else {
                for (const key in apiRequest) {
                  if (!body.hasOwnProperty(key) || typeof body[key] !== typeof apiRequest[key]) {
                    return {
                      success: false,
                      statusCode: 415,
                      msg: 'Unsupported media type',
                      data: {},
                    };
                  }
                }
              }
              break;
            default:
              break;
          }
        }
      }
      const result = await next();
      // Add post-invocation logic here
      return this.returnValidatedResponse(
        apiDetails?.ApiRequestType,
        result,
        apiDetails?.ApiResponseOptions,
      );
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
