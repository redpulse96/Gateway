import { NotificationTransactionsController } from '.';
import {
  Count,
  CountSchema,
  del,
  Filter,
  FilterExcludingWhere,
  get,
  getModelSchemaRef,
  inject,
  param,
  patch,
  post,
  put,
  repository,
  requestBody,
  Utils,
  Where,
} from '../common';
import { InterfaceList, SmtpDetails, STATUS } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { NotificationServices } from '../models';
import { NotificationServicesRepository } from '../repositories';

const log = new LoggingInterceptor('utils');
const { Username } = SmtpDetails;

export class NotificationServicesController {
  constructor(
    @repository(NotificationServicesRepository)
    public notificationServicesRepository: NotificationServicesRepository,

    @inject(`controllers.NotificationTransactionsController`)
    public notificationTransactionsController: NotificationTransactionsController,
  ) {}

  public sendNotification(data: InterfaceList.NotificationFunction) {
    const { NotifCode, DestinationEmail, Body }: any = data;
    const serviceDetails: NotificationServices = Utils.NotificationServices.find(
      (v: any) => v.NotificationCode == NotifCode,
    );
    const sendMailObj: InterfaceList.NotificationObject = {
      DestinationEmail: DestinationEmail,
      NotifiactionSubject: serviceDetails.Subject,
      NotificationBody: Utils.processBodyFunction({
        type: 'string',
        body: `${serviceDetails.Message}`,
        options: Body,
      }),
    };
    this.sendEmail(sendMailObj);
  }

  private async sendEmail(mailObj: InterfaceList.NotificationObject) {
    const transporter: any = Utils.createMailerTransport();

    const mailOptions: InterfaceList.NodeMailerOptions = {
      from: Username,
      to: [].concat(mailObj.DestinationEmail),
      subject: mailObj.NotifiactionSubject,
      html: mailObj.NotificationBody,
    };
    log.info('---mailOptions---');
    log.info(mailOptions);
    const [err, res]: any[] = await Utils.executePromise(transporter.sendMail(mailOptions));
    if (err) {
      log.info('---transporter.sendMail.err---');
      log.info(err);
    }
    log.info('---transporter.sendMail.res---');
    log.info(res);

    const createNotificationInstance: any = {
      Source: mailOptions.from,
      Destination: mailOptions.to,
      Message: mailOptions.html,
      ReferenceID: res?.messageId,
      Status: err ? STATUS.FAILURE : STATUS.ACTIVE,
    };
    const [transactionErr, transactionRes]: any[] = await Utils.executePromise(
      this.notificationTransactionsController.create(createNotificationInstance),
    );
    if (transactionErr) {
      log.info('---transporter.sendMail.transactionErr---');
      log.info(transactionErr);
      return false;
    }
    log.info('---transporter.sendMail.transactionRes---');
    log.info(transactionRes);

    return transactionRes;
  }

  @post('/notificationservices', {
    responses: {
      '200': {
        description: 'NotificationServices model instance',
        content: { 'application/json': { schema: getModelSchemaRef(NotificationServices) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationServices, {
            title: 'NewNotificationServices',
            exclude: ['NotificationServiceID'],
          }),
        },
      },
    })
    notificationServices: Omit<NotificationServices, 'NotificationServiceID'>,
  ): Promise<NotificationServices> {
    return this.notificationServicesRepository.create(notificationServices);
  }

  @get('/notificationservices/count', {
    responses: {
      '200': {
        description: 'NotificationServices model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(NotificationServices) where?: Where<NotificationServices>,
  ): Promise<Count> {
    return this.notificationServicesRepository.count(where);
  }

  @get('/notificationservices', {
    responses: {
      '200': {
        description: 'Array of NotificationServices model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(NotificationServices, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(NotificationServices) filter?: Filter<NotificationServices>,
  ): Promise<NotificationServices[]> {
    return this.notificationServicesRepository.find(filter);
  }

  @patch('/notificationservices', {
    responses: {
      '200': {
        description: 'NotificationServices PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationServices, { partial: true }),
        },
      },
    })
    notificationServices: NotificationServices,
    @param.where(NotificationServices) where?: Where<NotificationServices>,
  ): Promise<Count> {
    return this.notificationServicesRepository.updateAll(notificationServices, where);
  }

  @get('/notificationservices/{id}', {
    responses: {
      '200': {
        description: 'NotificationServices model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(NotificationServices, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(NotificationServices, { exclude: 'where' })
    filter?: FilterExcludingWhere<NotificationServices>,
  ): Promise<NotificationServices> {
    return this.notificationServicesRepository.findById(id, filter);
  }

  @patch('/notificationservices/{id}', {
    responses: {
      '204': {
        description: 'NotificationServices PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(NotificationServices, { partial: true }),
        },
      },
    })
    notificationServices: NotificationServices,
  ): Promise<void> {
    await this.notificationServicesRepository.updateById(id, notificationServices);
  }

  @put('/notificationservices/{id}', {
    responses: {
      '204': {
        description: 'NotificationServices PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() notificationServices: NotificationServices,
  ): Promise<void> {
    await this.notificationServicesRepository.replaceById(id, notificationServices);
  }

  @del('/notificationservices/{id}', {
    responses: {
      '204': {
        description: 'NotificationServices DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.notificationServicesRepository.deleteById(id);
  }
}
