import { belongsTo, Entity, model, property } from '@loopback/repository';
import { PaymentVendor } from './payment-vendor.model';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'payment_partner'
    }
  }
})
export class PaymentPartner extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
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
      columnName: 'name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentPartnerName?: string;

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
  PaymentPartnerDescription?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'auth_scheme',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  AuthScheme?: string;

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

  @property({
    type: 'string',
    mysql: {
      columnName: 'collection_account_number',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  CollectionAccountNumber?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'collection_account_password',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  CollectionAccountPassword?: string;

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
      columnName: 'payment_intimation_route',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentIntimationRoute?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'payment_acknowledgment_route',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentAcknowledgmentRoute?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'payment_initiation_route',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  PaymentInitiationRoute?: string;

  @property({
    type: 'object',
    mysql: {
      columnName: 'external_endpoint_specs',
      dataType: 'object',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalEndpointSpecs?: any;

  @property({
    type: 'string',
    mysql: {
      columnName: 'allowed_country_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'TZ',
      nullable: 'N'
    }
  })
  AllowedCountryCode?: string;

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
  [ prop: string ]: any;

  constructor (data?: Partial<PaymentPartner>) {
    super(data);
  }
}

export interface PaymentPartnerRelations {
  // describe navigational properties here
}

export type PaymentPartnerWithRelations = PaymentPartner & PaymentPartnerRelations;
