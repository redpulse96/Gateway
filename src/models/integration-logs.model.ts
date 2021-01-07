import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'integration_logs'
    }
  }
})
export class IntegrationLogs extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'integration_log_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  IntegrationLogID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'api_hash',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiHash?: string;

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
    type: 'number',
    mysql: {
      columnName: 'vendor_type_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  VendorTypeID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'service_type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ServiceType?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'redirect_from',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  RedirectFrom?: string;

  @property({
    type: 'object',
    mysql: {
      columnName: 'headers',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiHeaders?: object | null;

  @property({
    type: 'object',
    mysql: {
      columnName: 'body',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Apibody?: object | null;

  @property({
    type: 'object',
    mysql: {
      columnName: 'response',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiResponse?: object | null;

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
  ApiResponseCode?: string;

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
  [ prop: string ]: any;

  constructor (data?: Partial<IntegrationLogs>) {
    super(data);
  }
}

export interface IntegrationLogsRelations {
  // describe navigational properties here
}

export type IntegrationLogsWithRelations = IntegrationLogs & IntegrationLogsRelations;
