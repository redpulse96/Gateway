import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'mno_merchants'
    }
  }
})
export class MnoMerchants extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'mno_merchant_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  MnoMerchantID?: number;

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
  MerchantName?: string;

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
  MerchantUsername?: string;

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
  MerchantPassword?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'mobile_number',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  MobileNumber?: string;

  @property({
    type: 'boolean',
    mysql: {
      columnName: 'is_merchant_registered',
      dataType: 'tinyint',
      dataLength: 1,
      dataPrecision: null,
      dataScale: 0,
      default: 0,
      nullable: 'Y'
    }
  })
  IsMerchantRegistered?: boolean;

  @property({
    type: 'string',
    mysql: {
      columnName: 'merchant_reference_id',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  MerchantReferenceID?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'external_merchant_reference_id',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalMerchantReferenceID?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'source',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Source?: string;

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

  constructor (data?: Partial<MnoMerchants>) {
    super(data);
  }
}

export interface MnoMerchantsRelations {
  // describe navigational properties here
}

export type MnoMerchantsWithRelations = MnoMerchants & MnoMerchantsRelations;
