import { Entity, hasMany, hasOne, model, property } from '@loopback/repository';
import { PaymentVendor } from './payment-vendor.model';
import { UserRoles } from './user-roles.model';

@model({
  settings: {
    strict: false,
    mysql: {
      table: 'users',
    },
  },
})
export class Users extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    mysql: {
      columnName: 'user_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  UserID?: number;

  @property({
    type: 'string',
    mysql: {
      columnName: 'name',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  Name?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'username',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  Username?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'email',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  Email?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'password',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  Password?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'address',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  Address?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'mobile_number',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'N',
    },
  })
  MobileNumber?: string;

  @property({
    type: 'number',
    mysql: {
      columnName: 'payment_vendor_id',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y',
    },
  })
  PaymentVendorID?: number;

  @hasOne(() => PaymentVendor, {
    keyFrom: 'PaymentVendorID',
    keyTo: 'PaymentVendorID',
  })
  payment_vendor: PaymentVendor;

  @property({
    type: 'string',
    mysql: {
      columnName: 'country_code',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y',
    },
  })
  CountryCode?: string;

  @property({
    type: 'string',
    mysql: {
      columnName: 'remarks',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'Y',
    },
  })
  Remarks?: any;

  @property({
    type: 'string',
    mysql: {
      columnName: 'status',
      dataType: 'string',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      default: 'active',
      nullable: 'N',
    },
  })
  Status?: string;

  @property({
    type: 'date',
    mysql: {
      columnName: 'created_at',
      dataType: 'timestamp',
      default: 'CURRENT_TIMESTAMP',
      nullable: 'N',
    },
  })
  CreatedAt?: string;

  @property({
    type: 'date',
    mysql: {
      columnName: 'updated_at',
      dataType: 'timestamp',
      default: 'CURRENT_TIMESTAMP',
      nullable: 'N',
    },
  })
  UpdatedAt?: string;

  @hasMany(() => UserRoles, {
    keyFrom: 'UserID',
    keyTo: 'UserID',
    name: 'user_roles',
  })
  user_roles: UserRoles[];

  constructor(data?: Partial<Users>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = Users & UserRelations;
