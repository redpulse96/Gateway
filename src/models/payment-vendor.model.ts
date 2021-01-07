import { belongsTo, Entity, hasMany, model, property } from '@loopback/repository';
import { OriginatorFormatMapping } from './originator-format-mapping.model';
import { PaymentPartner } from './payment-partner.model';
import { VendorType } from './vendor-type.model';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'payment_vendor'
    }
  }
})
export class PaymentVendor extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
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
      columnName: 'vendor_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  VendorCode?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'code_scheme',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  CodeScheme?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'secret_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  SecretCode?: string;

  @belongsTo(() => VendorType, {
    name: 'vendor_type',
    keyFrom: 'VendorTypeID',
    keyTo: 'VendorTypeID'
  }, {
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
      columnName: 'name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentVendorName?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'description',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentVendorDescription?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'username',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Username?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'password',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Password?: string;

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
      columnName: 'vendor_processing_route',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  VendorProcessingRoute?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'vendor_intimation_route',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  VendorIntimationRoute?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'business_tin',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'TZ',
      nullable: 'N'
    }
  })
  BusinessTIN?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'average_customer',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'TZ',
      nullable: 'N'
    }
  })
  AverageCustomer?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'tax_certificate_url',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'TZ',
      nullable: 'N'
    }
  })
  TaxCertificateURL?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'country_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'TZ',
      nullable: 'N'
    }
  })
  CountryCode?: string;

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

  @hasMany(() => PaymentPartner, {
    keyFrom: 'PaymentVendorID',
    keyTo: 'PaymentVendorID'
  })
  payment_partner: PaymentPartner;

  @hasMany(() => OriginatorFormatMapping, {
    keyFrom: 'PaymentVendorID',
    keyTo: 'PaymentVendorID'
  })
  originator_formats: OriginatorFormatMapping[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor (data?: Partial<PaymentVendor>) {
    super(data);
  }
}

export interface PaymentVendorRelations {
  // describe navigational properties here
}

export type PaymentVendorWithRelations = PaymentVendor & PaymentVendorRelations;
