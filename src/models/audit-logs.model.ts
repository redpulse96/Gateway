import { Users } from '.';
import { belongsTo, Entity, model, property } from '../common';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'audit_logs'
    }
  }
})
export class AuditLogs extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'audit_log_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  AuditLogID?: number;

  @belongsTo(() => Users, {
    name: 'user',
    keyFrom: 'UserID',
    keyTo: 'UserID'
  }, {
    type: 'number',
    mysql: {
      columnName: 'user_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y'
    }
  })
  UserID: any;

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
  Name?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'email',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Email?: string;

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
  Path?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'action',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Action?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'method',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Method?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'operation',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Operation?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'module_name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ModuleName?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'access_right_name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  AccessRightName?: string;

  @property({
    type: 'object',
    mysql: {
      columnName: 'headers',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiHeaders?: object | null;

  @property({
    type: 'object',
    mysql: {
      columnName: 'body',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  Apibody?: object | null;

  @property({
    type: 'object',
    mysql: {
      columnName: 'response',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  ApiResponse?: object | null;

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

  constructor (data?: Partial<AuditLogs>) {
    super(data);
  }
}

export interface AuditLogsRelations {
  // describe navigational properties here
}

export type AuditLogsWithRelations = AuditLogs & AuditLogsRelations;
