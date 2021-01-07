import { belongsTo, Entity, model, property } from '@loopback/repository';
import { PaymentVendor } from './payment-vendor.model';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'originator_format_mapping'
    }
  }
})
export class OriginatorFormatMapping extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'originator_format_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  OriginatorFormatMappingID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'external_reference_id',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalReferenceID: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'transaction_id',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  TransactionID?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'from_msisdn',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  FromMsisdn?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'reference_msisdn',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ReferenceMsisdn?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'amount',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Amount?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'company_name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  CompanyName?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'company_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  CompanyCode?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'payment_status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentStatus?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Type?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'partner_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PartnerCode?: string;

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

  @belongsTo(() => PaymentVendor, {
    name: 'payment_vendor'
  }, {
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
  PaymentVendorID: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor (data?: Partial<OriginatorFormatMapping>) {
    super(data);
  }
}

export interface OriginatorFormatMappingRelations {
  // describe navigational properties here
}

export type OriginatorFormatMappingWithRelations = OriginatorFormatMapping & OriginatorFormatMappingRelations;
