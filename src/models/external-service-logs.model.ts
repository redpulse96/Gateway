import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'external_service_logs'
    }
  }
})
export class ExternalServiceLogs extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'external_service_log_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServiceLogID?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'payment_partner_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentPartnerID?: number;

  @property({
    type: 'number',
    mysql: {
      columnName: 'payment_vendor_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentVendorID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'path',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServicePath?: string;

  @property({
    type: 'object',
    mysql: {
      columnName: 'request_headers',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServiceHeaders?: object | null;

  @property({
    type: 'string',
    mysql: {
      columnName: 'request_body',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServiceBody?: any;

  @property({
    type: 'string',
    mysql: {
      columnName: 'response',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServiceResponse?: any;

  @property({
    type: 'string',
    mysql: {
      columnName: 'response_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServiceResponseCode?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      nullable: 'N'
    }
  })
  Status?: string;

  @property({
    type: 'date',
    mysql: {
      columnName: 'created_at',
      dataType: 'timestamp',
      default: 'CURRENT_TIMESTAMP',
      nullable: 'N'
    }
  })
  CreatedAt?: string;

  @property({
    type: 'date',
    mysql: {
      columnName: 'updated_at',
      dataType: 'timestamp',
      default: 'CURRENT_TIMESTAMP',
      nullable: 'N'
    }
  })
  UpdatedAt?: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor (data?: Partial<ExternalServiceLogs>) {
    super(data);
  }
}

export interface ExternalServiceLogsRelations {
  // describe navigational properties here
}

export type ExternalServiceLogsWithRelations = ExternalServiceLogs & ExternalServiceLogsRelations;
