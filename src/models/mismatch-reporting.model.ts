import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'mistmacth_reporting'
    }
  }
})
export class MismatchReporting extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'mistmacth_reporting_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  MistmacthReportingID?: number;

  @property({
    type: 'object',
    mysql: {
      columnName: 'external_refernce_id',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalReferenceID?: object;

  @property({
    type: 'object',
    mysql: {
      columnName: 'sender_msisdn',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  SenderMsisdn?: object;

  @property({
    type: 'object',
    mysql: {
      columnName: 'reference_msisdn',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ReferenceMsisdn?: object;

  @property({
    type: 'object',
    mysql: {
      columnName: 'amount',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Amount?: object;

  @property({
    type: 'object',
    mysql: {
      columnName: 'company_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  CompanyCode?: object;

  @property({
    type: 'object',
    mysql: {
      columnName: 'payment_status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentStatus?: object;

  @property({
    type: 'object',
    mysql: {
      columnName: 'type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Type?: object;

  @property({
    type: 'string',
    mysql: {
      columnName: 'is_matched',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      nullable: 'N'
    }
  })
  IsMatched?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'reason',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      nullable: 'N'
    }
  })
  Reason?: string;

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

  constructor (data?: Partial<MismatchReporting>) {
    super(data);
  }
}

export interface MismatchReportingRelations {
  // describe navigational properties here
}

export type MismatchReportingWithRelations = MismatchReporting & MismatchReportingRelations;
