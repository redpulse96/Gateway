import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'response_messages'
    }
  }
})
export class ResponseMessages extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'response_message_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ResponseMessageID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'message_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  MessageCode?: string;

  @property({
    type: 'boolean',
    mysql: {
      columnName: 'success',
      dataType: 'tinyint',
      dataLength: 1,
      dataPrecision: null,
      dataScale: 0,
      default: 0,
      nullable: 'Y'
    }
  })
  Success?: boolean;

  @property({
    type: 'string',
    mysql: {
      columnName: 'message',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Message?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'status_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  StatusCode?: string;

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
  ResponseCode?: string;

  @property({
    type: 'object',
    mysql: {
      columnName: 'response_data',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ResponseData?: object;

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

  constructor (data?: Partial<ResponseMessages>) {
    super(data);
  }
}

export interface ResponseMessagesRelations {
  // describe navigational properties here
}

export type ResponseMessagesWithRelations = ResponseMessages & ResponseMessagesRelations;
