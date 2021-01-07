import { Entity, model, property, belongsTo, hasMany, hasOne } from '@loopback/repository';
import { AccessRights } from './access-rights.model';
import { RoleAccessRightsMapping } from './role-access-rights-mapping.model';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'roles'
    }
  }
})
export class Roles extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'role_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  RoleID?: number;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values([ 'normal', 'superadmin' ])
    },
    mysql: {
      columnName: 'role_type',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      enum: [ 'normal', 'superadmin' ],
      nullable: 'Y'
    }
  })
  RoleType?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'role_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  RoleCode?: string;

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
  RoleName?: string;

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
  RoleDescription?: string;

  @belongsTo(() => Roles, {
    keyFrom: 'SupervisorRoleID',
    keyTo: 'RoleID',
    name: 'supervisor_role'
  }, {
    type: 'number',
    mysql: {
      columnName: 'supervisor_role_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y'
    }
  })
  SupervisorRoleID?: number;

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

  @hasMany(() => RoleAccessRightsMapping, {
    keyFrom: 'RoleID',
    keyTo: 'RoleID',
    name: 'role_access_rights'
  })
  role_access_rights: RoleAccessRightsMapping[];

  constructor (data?: Partial<Roles>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Roles & RoleRelations;
