import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'access_rights'
    }
  }
})
export class AccessRights extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'access_right_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  AccessRightID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'access_right_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  AccessRightCode?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values([ 'useractions', 'transactions', 'superadmin' ])
    },
    mysql: {
      columnName: 'type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      enum: [ 'useractions', 'transactions', 'superadmin' ],
      nullable: 'Y'
    }
  })
  Type?: string;

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
  AccessRightName?: string;

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
  AccessRightDescription?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values([ 'active', 'inactive', 'deleted' ])
    },
    mysql: {
      columnName: 'status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      enum: [ 'active', 'inactive', 'deleted' ],
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

  constructor (data?: Partial<AccessRights>) {
    super(data);
  }
}

export interface AccessRightsRelations {
  // describe navigational properties here
}

export type AccessRightsWithRelations = AccessRights & AccessRightsRelations;
