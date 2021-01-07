import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'external_services'
    }
  }
})
export class ExternalServices extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'external_service_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ExternalServiceID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'service_name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ServiceName?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(['object', 'string', 'form'])
    },
    mysql: {
      columnName: 'request_type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'object',
      enum: ['object', 'string', 'form'],
      nullable: 'N'
    }
  })
  ApiRequestType?: string;

  @property({
    type: 'object',
    mysql: {
      columnName: 'request_options',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiRequestOptions?: object | null;

  @property({
    type: 'string',
    mysql: {
      columnName: 'request',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiRequest?: unknown;

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

  constructor (data?: Partial<ExternalServices>) {
    super(data);
  }
}

export interface ExternalServicesRelations {
  // describe navigational properties here
}

export type ExternalServicesWithRelations = ExternalServices & ExternalServicesRelations;
