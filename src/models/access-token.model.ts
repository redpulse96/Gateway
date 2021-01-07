import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'access_token'
    }
  }
})
export class AccessToken extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'access_token_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  AccessTokenID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'authorization',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Authorization?: string;

  @property({
    type: 'number',
    mysql: {
      columnName: 'expires_in',
      dataType: 'bigInt',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExpiresIn?: number;

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

  constructor (data?: Partial<AccessToken>) {
    super(data);
  }
}

export interface AccessTokenRelations {
  // describe navigational properties here
}

export type AccessTokenWithRelations = AccessToken & AccessTokenRelations;
