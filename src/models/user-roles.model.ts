import { belongsTo, Entity, model, property } from '@loopback/repository';
import { Roles } from './roles.model';
import { Users } from './users.model';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'user_roles'
    }
  }
})
export class UserRoles extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'user_role_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  UserRoleID?: number;

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

  @belongsTo(() => Roles, {
    name: 'role',
    keyFrom: 'RoleID',
    keyTo: 'RoleID'
  }, {
    type: 'number',
    mysql: {
      columnName: 'role_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y'
    }
  })
  RoleID: any;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(['pending', 'active', 'inactive', 'deleted'])
    },
    mysql: {
      columnName: 'status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      enum: ['pending', 'active', 'inactive', 'deleted'],
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
  // @belongsTo(() => Users, { name: 'user' })
  // testuserid: number;

  // @belongsTo(() => Roles, { name: 'role' })
  // testroleid: number;

  constructor (data?: Partial<UserRoles>) {
    super(data);
  }
}

export interface UserRoleRelations {
  // describe navigational properties here
}

export type UserRoleWithRelations = UserRoles & UserRoleRelations;
