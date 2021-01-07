import { Entity, model, property, belongsTo } from '@loopback/repository';
import { AccessRights, Roles } from '.';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'role_access_rights_mapping'
    }
  }
})
export class RoleAccessRightsMapping extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'role_access_rights_mapping_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N'
    }
  })
  RoleAccessRightsMappingID?: number;

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

  @belongsTo(() => AccessRights, {
    keyFrom: 'AccessRightID',
    keyTo: 'AccessRightID',
    name: 'access_rights'
  }, {
    type: 'number',
    mysql: {
      columnName: 'access_right_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y'
    }
  })
  AccessRightID?: any;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values([ 'pending', 'active', 'inactive', 'deleted' ])
    },
    mysql: {
      columnName: 'status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      enum: [ 'pending', 'active', 'inactive', 'deleted' ],
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

  constructor (data?: Partial<RoleAccessRightsMapping>) {
    super(data);
  }
}

export interface RoleAccessRightsMappingRelations {
  // describe navigational properties here
}

export type RoleAccessRightsMappingWithRelations = RoleAccessRightsMapping & RoleAccessRightsMappingRelations;
