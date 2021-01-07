import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'api_configurations'
    }
  }
})
export class ApiConfigurations extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'api_configuration_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiConfigurationID?: number;

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
  ApiPath?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values([ 'object', 'string' ])
    },
    mysql: {
      columnName: 'request_type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'object',
      enum: [ 'object', 'string' ],
      nullable: 'N'
    }
  })
  ApiRequestType?: string;

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
      columnName: 'error_response',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiErrorResponse?: unknown;

  @property({
    type: 'string',
    mysql: {
      columnName: 'success_response',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiSuccessResponse?: unknown;

  @property({
    type: 'object',
    mysql: {
      columnName: 'response_options',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiResponseOptions?: object | null;

  @property({
    type: 'boolean',
    mysql: {
      columnName: 'skip_validation',
      dataType: 'tinyint',
      dataLength: 1,
      dataPrecision: null,
      dataScale: 0,
      default: 0,
      nullable: 'Y'
    }
  })
  SkipValidation?: boolean;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values([ 'incoming', 'outgoing' ])
    },
    mysql: {
      columnName: 'type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'incoming',
      enum: [ 'incoming', 'outgoing' ],
      nullable: 'N'
    }
  })
  ApiType?: string;

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

  constructor (data?: Partial<ApiConfigurations>) {
    super(data);
  }
}

export interface ApiConfigurationsRelations {
  // describe navigational properties here
}

export type ApiConfigurationsWithRelations = ApiConfigurations & ApiConfigurationsRelations;
