import { auditLogDef } from '../api-specs/audit-logs';
import {
  api,
  authenticate,
  Count,
  inject,
  repository,
  Request,
  RestBindings,
  Utils,
} from '../common';
import {
  AccessRightsApiMapping,
  InterfaceList,
  JWT_STRATEGY_NAME,
  ResponseMappings,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors';
import { AuditLogs } from '../models';
import { AccessRightsRepository, AuditLogsRepository } from '../repositories';
const log = new LoggingInterceptor('audit-logs.Controller');

@api(auditLogDef)
export class AuditLogsController {
  constructor(
    @repository(AuditLogsRepository)
    public auditLogsRepository: AuditLogsRepository,

    @repository(AccessRightsRepository)
    public accessRightsRepository: AccessRightsRepository,
  ) {}

  async create(auditLogs: Omit<AuditLogs, 'AuditLogID'>): Promise<AuditLogs> {
    return this.auditLogsRepository.create(auditLogs);
  }

  @authenticate(JWT_STRATEGY_NAME)
  async find(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query }: any = request;
    log.info('---find.query---');
    const filter: any = {
      where: {
        ...Utils.fetchTimestampFilter(query),
        Path: { nlike: '/azam/audit%' },
      },
      order: query?.order ? `${query?.order} DESC` : 'CreatedAt DESC',
      skip: eval(query.skipPagination)
        ? 0
        : Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) }),
      limit: eval(query.skipPagination) ? undefined : parseInt(query.limit) || undefined,
    };
    if (query?.AccessRightID) {
      const [accessRightsError, accessRights]: any[] = await Utils.executePromise(
        this.accessRightsRepository.findById(query.AccessRightID),
      );
      if (accessRightsError) {
        log.error('---accessRightsError---', accessRightsError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---accessRights---');
      query.UserID?.length && (filter.where.UserID = { inq: [].concat(query.UserID) });
      filter.where.ModuleName = accessRights.Type;
      filter.where.Action =
        AccessRightsApiMapping[`${accessRights.Type}_${accessRights.AccessRightName}`];
    }
    const auditLogList: AuditLogs[] = await this.auditLogsRepository.find(filter);
    const totalCount: Count = await this.auditLogsRepository.count({ Status: STATUS.ACTIVE });
    const finalResponse: AuditLogs[] = [];
    if (auditLogList?.length) {
      auditLogList.forEach((val: AuditLogs) => {
        if (val.Path) finalResponse.push(val);
      });
      log.info('---AUDIT-LOGS-PRESENT---');
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: {
          totalCount: totalCount.count,
          AuditLogs: [...finalResponse],
        },
      };
    } else {
      log.info('---AUDIT-LOGS-EMPTY---');
      return {
        messageCode: ResponseMappings['EMPTY_RESPONSE'],
        data: {
          totalCount: 0,
          AuditLogs: [],
        },
      };
    }
  }
}
