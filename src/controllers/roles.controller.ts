import { UserController } from '.';
import {
  authenticate,
  Count,
  CountSchema,
  del,
  Filter,
  FilterExcludingWhere,
  get,
  getModelSchemaRef,
  inject,
  param,
  patch,
  post,
  put,
  repository,
  Request,
  requestBody,
  RestBindings,
  Utils,
  Where,
} from '../common';
import {
  InterfaceList,
  JWT_STRATEGY_NAME,
  ResponseMappings,
  RoleTypes,
  STATUS,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { AccessRights, Roles } from '../models';
import {
  RoleAccessRightsMappingRepository,
  RolesRepository,
  UserRolesRepository,
} from '../repositories';

const log = new LoggingInterceptor('user.Controllers');
export class RoleController {
  constructor(
    @repository(RolesRepository)
    public roleRepository: RolesRepository,

    @repository(UserRolesRepository)
    public userRolesRepository: UserRolesRepository,

    @repository(RoleAccessRightsMappingRepository)
    private roleAccessRightsMappingRepository: RoleAccessRightsMappingRepository,

    @inject(`controllers.UserController`)
    private userController: UserController,
  ) {}

  @post('/azam/roles', {
    responses: {
      '200': {
        description: 'Roles model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Roles) } },
      },
    },
  })
  @authenticate(JWT_STRATEGY_NAME)
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Roles, {
            title: 'NewRole',
            exclude: ['RoleID'],
          }),
        },
      },
    })
    role: Omit<Roles, 'RoleID'>,
  ): Promise<Roles> {
    return this.roleRepository.create(role);
  }

  @authenticate(JWT_STRATEGY_NAME)
  @post('/azam/roles/createrole', {
    responses: {},
  })
  async createRole(
    @requestBody({})
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body, user }: any = request;
    try {
      log.info('---createRole.body---');
      log.info(body);

      log.info('---createRole.user---');
      log.info(user);

      const createNewRole: any = {
        RoleCode: body.RoleCode || body.RoleName.replace(/\s/g, '_').toUpperCase(),
        RoleName: body.RoleName,
        RoleDescription: body.RoleDescription,
        SupervisorRoleID: body.SupervisorRoleID,
        RoleType: RoleTypes['Normal'],
        Status: STATUS.ACTIVE,
      };
      const [createRoleError, createRole]: any[] = await Utils.executePromise(
        this.roleRepository.create(createNewRole),
      );
      if (createRoleError || !createRole) {
        log.info('---createRoleError---');
        log.info(createRole);
        return { messageCode: ResponseMappings['FAILURE'] };
      }
      log.info('---createRole---');
      log.info(createRole);

      const createRoleAccessRights: any[] = [];
      body.AccessRights.forEach((val: number) => {
        const obj: any = {
          RoleID: createRole.RoleID,
          AccessRightID: val,
          Status: STATUS.ACTIVE,
        };
        createRoleAccessRights.push(obj);
      });
      const [createAccessRightsError, createAccessRights]: any[] = await Utils.executePromise(
        this.roleAccessRightsMappingRepository.createAll(createRoleAccessRights),
      );
      if (createAccessRightsError || !createAccessRights?.length) {
        log.info('---createAccessRightsError---');
        log.info(createAccessRightsError);
        return { messageCode: ResponseMappings['FAILURE'] };
      }
      log.info('---createAccessRights---');
      log.info(createAccessRights);

      const createUserRole: any = {
        user,
        body: {
          UserID: user.UserID,
          RoleID: [createRole.RoleID],
        },
      };
      log.info('---createUserRoleForVendorAdmin---');
      log.info(createUserRole);
      const [userRoleError, userRole]: any[] = await Utils.executePromise(
        this.userController.attachRolesToUserFunction(createUserRole),
      );
      if (userRoleError) {
        log.info('---userRoleError---');
        log.info(userRoleError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!userRole) {
        log.info('---!userRole---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---userRole---');
      log.info(userRole);

      return {
        messageCode: ResponseMappings['INSTANCE_CREATION_SUCCESS'],
        data: {
          Roles: createRole,
          AccessRights: createAccessRights,
        },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @get('/azam/roles/count', {
    responses: {
      '200': {
        description: 'Roles model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(@param.where(Roles) where?: Where<Roles>): Promise<Count> {
    return this.roleRepository.count(where);
  }

  @get('/azam/roles', {
    responses: {
      '200': {
        description: 'Array of Roles model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Roles, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(@param.filter(Roles) filter?: Filter<Roles>): Promise<Roles[]> {
    return this.roleRepository.find(filter);
  }

  @authenticate(JWT_STRATEGY_NAME)
  @get('/azam/roles/fetchparentroles', {
    responses: {},
  })
  async findParentRoles(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    try {
      log.info('---findParentRoles.user---');
      log.info(user);

      log.info('---findParentRoles.query---');
      log.info(query);
      const userRolesFilter: Filter = {
        where: {
          UserID: user.UserID,
          Status: STATUS.ACTIVE,
        },
      };
      const [userRolesError, userRoles]: any[] = await Utils.executePromise(
        this.userRolesRepository.find(userRolesFilter),
      );
      if (userRolesError) {
        log.info('---userRolesError---');
        log.info(userRolesError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!userRoles?.length) {
        log.info('---!userRoles?.length---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---userRoles---');
      log.info(userRoles);
      const rolesFilter: Filter = {
        where: {
          RoleID: { inq: userRoles.map((v: any) => v.RoleID) },
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'supervisor_role',
            scope: {
              where: {
                Status: STATUS.ACTIVE,
              },
            },
          },
        ],
        order: query.order,
        skip: Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) }),
        limit: parseInt(query.limit) || 10,
      };
      if (user.isSuperadmin) {
        userRolesFilter.where = { Status: STATUS.ACTIVE };
      }
      const [rolesError, roles]: any[] = await Utils.executePromise(
        this.roleRepository.find(rolesFilter),
      );
      if (rolesError) {
        log.info('---findParentRoles.rolesError---');
        log.info(rolesError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!roles?.length) {
        log.info('---!roles?.length---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---findParentRoles.roles---');
      log.info(roles);
      const rolesResponse: Roles[] = [];
      roles.forEach((val: any) => {
        const obj: any = {
          RoleID: val.RoleID,
          RoleCode: val.RoleCode,
          RoleName: val.RoleName,
          RoleDescription: val.RoleDescription,
          isSuperadmin: val.RoleType == RoleTypes['Superadmin'],
        };
        if (val.supervisor_role) {
          obj.SupervisorRoleID = val.SupervisorRoleID;
          obj.SupervisorRoleObj = {
            SupervisorRoleID: val.SupervisorRoleID,
            SupervisorRoleCode: val.supervisor_role.RoleCode,
            SupervisorRoleName: val.supervisor_role.RoleName,
            SupervisorRoleDescription: val.supervisor_role.RoleDescription,
          };
        }
        rolesResponse.push(obj);
      });
      log.info('---findParentRoles.rolesResponse---');
      log.info(rolesResponse);

      if (!rolesResponse?.length) return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };

      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { rolesResponse },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  @get('/azam/roles/fetchchildroles', {
    responses: {},
  })
  async findChildRoles(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query }: any = request;
    try {
      const filter: Filter = {
        where: {
          RoleID: query.RoleID,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'role_access_rights',
            scope: {
              where: {
                Status: STATUS.ACTIVE,
              },
              include: [
                {
                  relation: 'access_rights',
                },
              ],
            },
          },
        ],
      };
      const [accessRightsError, accessRights]: any[] = await Utils.executePromise(
        this.roleRepository.findOne(filter),
      );
      if (accessRightsError) {
        log.info('---findChildRoles.accessRightsError---');
        log.info(accessRightsError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!accessRights) {
        log.info('---!accessRights---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---findChildRoles.accessRights---');
      log.info(accessRights);
      const accessRightsResponse: AccessRights[] = [];

      accessRights?.role_access_rights?.length &&
        accessRights?.role_access_rights.forEach((elem: any) => {
          const obj: any = {
            AccessRightID: elem.access_rights.AccessRightID,
            AccessRightName: elem.access_rights.AccessRightName,
            AccessRightCode: elem.access_rights.AccessRightCode,
            AccessRightDescription: elem.access_rights.AccessRightDescription,
            AccessRightType: elem.access_rights?.Type ? elem.access_rights.Type : undefined,
          };
          accessRightsResponse.push(obj);
        });
      if (!accessRightsResponse?.length) return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };

      const finalResponse: any = Utils.groupByFunction({
        inputArr: accessRightsResponse,
        groupByKey: 'AccessRightType',
      });
      log.info('---findChildRoles.finalResponse---');
      log.info(finalResponse);

      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { ...finalResponse },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @patch('/azam/roles', {
    responses: {
      '200': {
        description: 'Roles PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Roles, { partial: true }),
        },
      },
    })
    role: Roles,
    @param.where(Roles) where?: Where<Roles>,
  ): Promise<Count> {
    return this.roleRepository.updateAll(role, where);
  }

  @get('/azam/roles/{id}', {
    responses: {
      '200': {
        description: 'Roles model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Roles, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Roles, { exclude: 'where' }) filter?: FilterExcludingWhere<Roles>,
  ): Promise<Roles> {
    return this.roleRepository.findById(id, filter);
  }

  @patch('/azam/roles/{id}', {
    responses: {
      '204': {
        description: 'Roles PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Roles, { partial: true }),
        },
      },
    })
    role: Roles,
  ): Promise<void> {
    await this.roleRepository.updateById(id, role);
  }

  @put('/azam/roles/{id}', {
    responses: {
      '204': {
        description: 'Roles PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() role: Roles,
  ): Promise<void> {
    await this.roleRepository.replaceById(id, role);
  }

  @del('/azam/roles/{id}', {
    responses: {
      '204': {
        description: 'Roles DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.roleRepository.deleteById(id);
  }
}
