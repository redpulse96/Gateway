import { repository, Utils } from '../common';
import { ApiList, INFOBIP, STATUS } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { NotificationTransactions } from '../models';
import { NotificationTransactionsRepository } from '../repositories';

const log = new LoggingInterceptor('notification.Controller');

export class NotificationTransactionsController {
  constructor(
    @repository(NotificationTransactionsRepository)
    private notificationsRepository: NotificationTransactionsRepository,
  ) {}

  public async callNotificationTransactions(infobipObject: any) {
    infobipObject = JSON.parse(JSON.stringify(infobipObject));
    const createNotificationTableObject: any = {
      Message: infobipObject.Text,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString(),
      Source: infobipObject.MobileNumber,
      Status: INFOBIP.PENDING,
      ReferenceID: Utils.generateReferenceID(infobipObject.Text, infobipObject.MobileNumber),
    };
    try {
      const message = await this.notificationsRepository.create(createNotificationTableObject);
      log.info('came here', infobipObject);
      const options = {
        apiPath: ApiList['INFOBIP_AIP_NAME'],
        body: {
          MobileNumber: infobipObject.MobileNumber,
          SmsText: infobipObject.Text,
        },
      };
      return await Utils.callRequest(options)
        .then(async (messgaeService: any) => {
          infobipObject.messageID = messgaeService[0];
          infobipObject.Status = STATUS.SUCCESS;
          await this.notificationsRepository.updateById(message.NotificationID, {
            ...message,
            status: STATUS.SUCCESS,
          });
          log.info('messgaeService====>', JSON.stringify(messgaeService));
          return {
            success: true,
            message: 'message sent successfully',
            data: messgaeService,
          };
        })
        .catch(async (err: any) => {
          log.error('came in erro?????', err);
          infobipObject.messageID = err.message;
          infobipObject.Status = STATUS.FAILURE;
          await this.notificationsRepository.updateById(message.ID, {
            ...message,
            status: STATUS.SUCCESS,
          });
          return {
            success: false,
            message: 'Failed to send the message to INFOBIP',
            data: err,
          };
        });
    } catch (err) {
      createNotificationTableObject.Status = STATUS.FAILURE;
      await this.notificationsRepository.create(createNotificationTableObject);
    }
  }

  public async create(request: any) {
    const createTransactionInstance: NotificationTransactions = { ...request };
    return await this.notificationsRepository.create(createTransactionInstance);
  }
}
