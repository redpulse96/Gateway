import { NotificationServicesController, PaymentVendorCrudController } from '.';
import { userDef } from '../api-specs/users';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../authentication';
import {
  api,
  authenticate,
  Filter,
  inject,
  repository,
  Request,
  requestBody,
  RestBindings,
  TokenService,
  UserService,
  Utils,
} from '../common';
import {
  HASH_SCHEME,
  InterfaceList,
  JWT_STRATEGY_NAME,
  NotificationCodeMapping,
  ResponseMappings,
  RoleTypes,
  STATUS,
  SupervisorEmails,
  Urls,
} from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { UserRoles, Users } from '../models';
import {
  AccessTokenRepository,
  RolesRepository,
  UserRolesRepository,
  UsersRepository,
} from '../repositories';
import PasswordHasher from '../services/hash.password.bcryptjs';

const log = new LoggingInterceptor('user.Controllers');

@api(userDef)
export class UserController {
  constructor(
    @repository(AccessTokenRepository)
    private accessTokenRepository: AccessTokenRepository,

    @repository(UsersRepository)
    private userRepository: UsersRepository,

    @repository(RolesRepository)
    private roleRepository: RolesRepository,

    @repository(UserRolesRepository)
    private userRolesRepository: UserRolesRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,

    @inject(TokenServiceBindings.TOKEN_SERVICE)
    private jwtService: TokenService,

    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,

    @inject(UserServiceBindings.USER_SERVICE)
    private userService: UserService<Users, InterfaceList.Credentials>,

    @inject(`controllers.NotificationServicesController`)
    private notificationServicesController: NotificationServicesController,

    @inject(`controllers.PaymentVendorCrudController`)
    public paymentVendorCrudController: PaymentVendorCrudController,
  ) {}

  public checkAllowedAction(roles: any, checkRoleCode: string, options: any = undefined): boolean {
    // return true; // FOR testing purposes
    if (roles.RoleType.indexOf(RoleTypes['Superadmin']) > -1) return true;

    let flag: boolean = !!(roles.AccessRights.indexOf(checkRoleCode) > -1);
    if (options) {
      if (options.RoleType) {
        flag = !!(roles.RoleType.indexOf(checkRoleCode) > -1);
      }
    }
    return flag;
  }

  public async logInFunction(
    @requestBody()
    credentials: any,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    try {
      log.info('---credentials---');
      log.info(credentials);
      if (!credentials.email || !credentials.password)
        return { messageCode: ResponseMappings['BAD_REQUEST'] };

      const user: any = await this.userService.verifyCredentials(credentials);
      const responseRoles: any = {};
      let isSuperadmin: boolean = false;
      log.info('---user.details---');
      log.info(user);
      if (!user) return { messageCode: ResponseMappings['INVALID_CREDENTIALS'] };

      const userFilter: Filter = {
        where: {
          UserID: user.UserID,
          Status: STATUS.ACTIVE,
        },
        include: [
          {
            relation: 'role',
            scope: {
              where: {
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
                        scope: {
                          where: {
                            Status: STATUS.ACTIVE,
                          },
                        },
                      },
                    ],
                  },
                },
                {
                  relation: 'supervisor_role',
                },
              ],
            },
          },
        ],
      };
      const roles: any = await this.userRolesRepository.find(userFilter);
      log.info('---roles---');
      log.info(roles);
      if (roles?.length) {
        user.roles = {
          RoleType: [],
          AccessRights: [],
        };
        roles.map((r: any) => {
          user.roles.RoleType.push(r.role.RoleType);
          if (!r.role?.RoleCode) return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };

          if (r.role?.role_access_rights?.length) {
            r.role.role_access_rights.forEach((ar: any) => {
              user.roles.AccessRights.push(ar.access_rights.AccessRightCode);
            });
            responseRoles.RoleID = r.RoleID;
            responseRoles.RoleCode = r.role.RoleCode;
            responseRoles.RoleType = r.role.RoleType;
            responseRoles.AccesRights = {};
          }
          if (r.role.RoleType == RoleTypes['Superadmin']) isSuperadmin = true;
          if (r.role?.SupervisorRoleID && r.role?.supervisor_role) {
            responseRoles.SupervisorRoleCode = r.role.supervisor_role.RoleCode;
            responseRoles.SupervisorRole = {
              SupervisorRoleName: r.role.supervisor_role.RoleName,
              SupervisorRoleType: r.role.supervisor_role.RoleType,
            };
          }
          if (r.role?.role_access_rights?.length) {
            r.role.role_access_rights.forEach((ar: any) => {
              responseRoles.AccesRights[ar.access_rights.Type]?.length
                ? responseRoles.AccesRights[ar.access_rights.Type].push(
                    ar.access_rights.AccessRightName,
                  )
                : (responseRoles.AccesRights[ar.access_rights.Type] = [
                    ar.access_rights.AccessRightName,
                  ]);
            });
          }
        });
      }
      user.isSuperadmin = isSuperadmin;
      const userProfile = this.userService.convertToUserProfile(user);
      log.info('---userProfile---');
      log.info(userProfile);
      const token: any = await this.jwtService.generateToken(userProfile);
      if (!token.success) return token;

      const accessTokenInstance: any = {
        Authorization: token.token,
        ExpiresIn: Number(this.jwtExpiresIn),
        Status: STATUS.ACTIVE,
      };
      const accessTokenDetails: any = await this.accessTokenRepository.create(accessTokenInstance);
      if (!accessTokenDetails) return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };

      return {
        messageCode: ResponseMappings['USER_LOGGED_IN'],
        data: {
          Authorization: JSON.stringify({
            token: token.token,
            isSuperadmin,
            Email: user.Email,
            Name: user.Name,
            Address: user.Address,
            MobileNumber: user.MobileNumber,
            Roles: responseRoles,
          }),
        },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async registerUserFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    // if (!Object.keys(user?.Roles).length)
    //   return { messageCode: ResponseMappings[ 'UNAUTHORIZED_ACTION' ] };

    try {
      log.info('---registerUserFunction.body---');
      log.info(body);

      const checkUsernameExistance: Filter = {
        where: {
          or: [
            {
              Email: { like: `%${body.email}%` },
            },
            {
              Username: { like: `%${body.username || body.email}%` },
            },
          ],
        },
      };
      const [existingUserError, existingUserDetails]: any[] = await Utils.executePromise(
        this.userRepository.findOne(checkUsernameExistance),
      );
      if (existingUserError) {
        log.info('---existingUserError---');
        log.info(existingUserError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (existingUserDetails?.UserID) {
        log.info('---existingUserDetails---');
        log.info(existingUserDetails);
        return { messageCode: ResponseMappings['UNIQUE_USERNAME'] };
      }

      log.info('---USERNAME.UNIQUE---');
      const createUserInstance: any = {
        Email: body.email,
        Username: body.username,
        Name: body.fullName,
        Address: body.Address,
        MobileNumber: body.MobileNumber,
        Status: STATUS.PENDING,
      };
      if (body?.password)
        createUserInstance.Password = await this.passwordHasher.hashPassword(body.password);

      log.info('---createUserInstance---');
      log.info(createUserInstance);
      const [createUserError, createUserResult]: any[] = await Utils.executePromise(
        this.userRepository.create(createUserInstance),
      );
      if (createUserError) {
        log.info('---createUserError---');
        log.info(createUserError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---createUserResult---');
      log.info(createUserResult);

      if (body?.roles?.length) {
        const createUserRoleInstance: any = [];
        body.roles.forEach((val: number) => {
          const obj: any = {
            UserID: createUserResult.UserID,
            RoleID: val,
          };
          createUserRoleInstance.push({ obj });
        });
        log.info('---createUserRoleInstance---');
        log.info(createUserRoleInstance);
        const [createUserRoleError, createUserRoleResult]: any[] = await Utils.executePromise(
          this.userRolesRepository.createAll(createUserRoleInstance),
        );
        if (createUserRoleError) {
          log.info('---createUserRoleError---');
          log.info(createUserRoleError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        }
        log.info('---createUserRoleResult---');
        log.info(createUserRoleResult);
      }
      // Send the mail here
      const sendNotificationObj: InterfaceList.NotificationFunction = {
        NotifCode: NotificationCodeMapping['USER_REGISTERATION'],
        DestinationEmail: [].concat(createUserResult.Email),
        Body: {
          URL: `${Urls.UserRegistrationUrl}${createUserResult.UserID}`,
        },
      };
      this.notificationServicesController.sendNotification(sendNotificationObj);

      const userProfile: any = this.userService.convertToUserProfile(createUserResult);
      const token: string = await this.jwtService.generateToken(userProfile);
      return {
        messageCode: ResponseMappings['USER_REGISTERED'],
        data: {
          Authorization: JSON.stringify(token),
        },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async updateUserDetails(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<any> {
    const { body }: any = request;
    try {
      log.info('---updateUserDetails.body---');
      log.info(body);

      if (Utils.isEmpty(body?.UpdateUserObj))
        return { messageCode: ResponseMappings['BAD_REQUEST'] };

      const userFilter: Filter = {
        where: {
          Email: body.Email,
          Status: STATUS.ACTIVE,
        },
      };
      const [userError, userDetails]: any[] = await Utils.executePromise(
        this.userRepository.findOne(userFilter),
      );
      if (userError) {
        log.info('---updateUserDetails.userError---');
        log.info(userError);
        return { success: false, messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!userDetails) {
        log.info('---not.found.updateUserDetails.userDetails--');
        return { success: false, messageCode: ResponseMappings['INVALID_CREDENTIALS'] };
      }
      log.info('---updateUserDetails.userDetails---');
      log.info(userDetails);

      const updateObj: any = { ...body.UpdateUserObj };

      if (body.OldPassword && updateObj?.NewPassword) {
        const isPasswordMatching: boolean = await this.passwordHasher.comparePassword(
          body.OldPassword,
          userDetails.Password,
        );
        if (!isPasswordMatching) {
          log.info('---password.does.not.match.updateUserDetails.userDetails--');
          return { success: false, messageCode: ResponseMappings['INVALID_CREDENTIALS'] };
        }
        updateObj.Password = await this.passwordHasher.hashPassword(updateObj.NewPassword);
        delete updateObj['NewPassword'];
      }
      log.info('---updateUserDetails.updateObj---');
      log.info(updateObj);
      const [updateUserError, updateCurrentUser]: any[] = await Utils.executePromise(
        this.userRepository.updateById(userDetails.UserID, updateObj),
      );
      if (updateUserError) {
        log.info('---updateUserDetails.updateUserError---');
        log.info(updateUserError);
        return { success: false, messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---updateCurrentUser---');
      log.info(updateCurrentUser);
      return { success: true, messageCode: ResponseMappings['UPDATE_SUCCESS'] };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async logOutFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { headers } = request;
    try {
      const auth: any = headers.authorization?.split(' ')[1];
      const tokenDetails: any = await this.accessTokenRepository.findOne({
        where: {
          Authorization: auth,
          Status: STATUS.ACTIVE,
        },
      });
      if (!tokenDetails) return { messageCode: ResponseMappings['BAD_REQUEST'] };

      log.info('---tokenDetails---');
      log.info(tokenDetails);

      await this.accessTokenRepository.updateById(tokenDetails.AccessTokenID, {
        Status: STATUS.EXPIRED,
      });
      return { messageCode: ResponseMappings['USER_LOGGED_OUT'] };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async fetchUsersByFilterFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query, user }: any = request;
    // if (!Object.keys(user?.Roles).length)
    //   return { messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };

    try {
      log.info('---fetchUsersByFilterFunction.query---');
      log.info(query);

      // if (user?.Roles && !this.checkAllowedAction(user.Roles, RoleMappings['FETCH_USERS_BY_FILTER']))
      //   return { messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };

      const filter: Filter = {
        where: {
          ...Utils.fetchTimestampFilter(query),
          Status: query?.Status ? query.Status : STATUS.ACTIVE,
        },
        order: query.order,
        skip: Utils.fetchSkipFilter({ skip: parseInt(query.skip), limit: parseInt(query.limit) }),
        limit: parseInt(query.limit) || 10,
      };
      const [usersError, usersDetails]: any[] = await Utils.executePromise(
        this.userRepository.find(filter),
      );
      if (usersError) {
        log.info('---usersError---');
        log.info(usersError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!usersDetails?.length) {
        log.info('---!usersDetails?.length---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---usersDetails---');
      log.info(usersDetails);

      const responseData: any[] = [];
      usersDetails.forEach((val: Users) => {
        responseData.push({
          UserID: val.UserID,
          Name: val.Name || undefined,
          Email: val.Email,
          Address: val.Address || undefined,
          MobileNumber: val.MobileNumber || undefined,
          PaymentVendorID: val.PaymentVendorID || undefined,
          CountryCode: val.CountryCode || undefined,
          Status: val.Status,
        });
      });
      if (!responseData?.length) return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };

      log.info('---responseData---');
      log.info(responseData);
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: {
          totalCount: responseData.length,
          users: responseData,
        },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  private async mapFunction(combinedRequests: any[], user: any) {
    const approvedEmails: string[] = [];
    const rejectedEmails: string[] = [];
    const promises: any[] = [];

    combinedRequests.map(async (item: any) => {
      log.info('---combinedRequests.item---');
      log.info(item);
      const obj: any = {
        PaymentVendorID: user.PaymentVendorID,
        Remarks: item.Remarks,
        Status: item.Status,
      };
      item.Status == STATUS.ACTIVE
        ? approvedEmails.push(item.Email)
        : rejectedEmails.push(item.Email);
      promises.push(await this.userRepository.updateById(item.UserID, obj));
    });
    const [updateApprovedUsersError, updateApprovedUsersResult]: any[] = await Utils.executePromise(
      Promise.all(promises),
    );
    if (updateApprovedUsersError) {
      log.info('---updateApprovedUsersError---');
      log.info(updateApprovedUsersError);
      return false;
    }
    log.info('---updateApprovedUsersResult---');
    log.info(updateApprovedUsersResult);
    return { approvedEmails, rejectedEmails };
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async approveOrRejectUserCreationFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body, user }: any = request;
    try {
      log.info('---approveOrRejectUserCreationFunction.body---');
      log.info(body);
      let combinedRequests: any = [];

      if (body.ApprovedRequests?.length)
        combinedRequests = [].concat(combinedRequests, body.ApprovedRequests);

      if (body.RejectedRequests?.length)
        combinedRequests = [].concat(combinedRequests, body.RejectedRequests);

      if (combinedRequests?.length) {
        const [mapError, mapResult]: any[] = await Utils.executePromise(
          this.mapFunction(combinedRequests, user),
        );
        if (mapError || !mapResult) {
          log.info('---mapError---');
          log.info(mapError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        }

        if (mapResult?.approvedEmails?.length) {
          log.info('---mapResult?.approvedEmails---');
          log.info(mapResult.approvedEmails);
          const sendApprovedNotification: InterfaceList.NotificationFunction = {
            NotifCode: NotificationCodeMapping['USER_ACTIVATE'],
            DestinationEmail: [].concat(mapResult.approvedEmails),
          };
          this.notificationServicesController.sendNotification(sendApprovedNotification);
        }
        if (mapResult?.rejectedEmails?.length) {
          log.info('---mapResult?.rejectedEmails---');
          log.info(mapResult.rejectedEmails);
          const sendRejectedNotification: InterfaceList.NotificationFunction = {
            NotifCode: NotificationCodeMapping['USER_DEACTIVATE'],
            DestinationEmail: [].concat(mapResult.rejectedEmails),
          };
          this.notificationServicesController.sendNotification(sendRejectedNotification);
        }

        return { messageCode: ResponseMappings['USERS_REGISTRATION_COMPLETED'] };
      } else {
        log.info('---EMPTY.REQUEST---');
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async completeRegistrationFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    try {
      const { UserDetails, PaymentVendorDetails } = body;

      if (Utils.isEmpty(UserDetails)) return { messageCode: ResponseMappings['BAD_REQUEST'] };

      const updateObj: any = {
        ...UserDetails,
        Status: STATUS.PENDING,
      };
      log.info('---completeRegistrationFunction.UserDetails---');
      log.info(UserDetails);

      if (!Utils.isEmpty(PaymentVendorDetails)) {
        PaymentVendorDetails.CodeScheme = HASH_SCHEME.MD5;
        log.info('---completeRegistrationFunction.PaymentVendorDetails---');
        log.info(PaymentVendorDetails);

        const [paymentVendorError, paymentVendorDetails]: any[] = await Utils.executePromise(
          this.paymentVendorCrudController.create(PaymentVendorDetails),
        );
        if (paymentVendorError || !(paymentVendorDetails.success || paymentVendorDetails?.data)) {
          log.info('---paymentVendorError---');
          log.info(paymentVendorError);
          return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
        }
        log.info('---paymentVendorDetails---');
        log.info(paymentVendorDetails);
        updateObj.PaymentVendorID = paymentVendorDetails.data.PaymentVendorID;
        updateObj.Status = STATUS.ACTIVE;
      }
      if (UserDetails.NewPassword) {
        updateObj.Password = await this.passwordHasher.hashPassword(updateObj.NewPassword);
        delete updateObj['NewPassword'];
      }
      const [userError, userDetails]: any[] = await Utils.executePromise(
        this.userRepository.updateById(UserDetails.UserID, updateObj),
      );
      if (userError) {
        log.info('---userError---');
        log.info(userError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---userDetails---');
      log.info(userDetails);

      // Send the mail here
      const sendNotificationObj: InterfaceList.NotificationFunction = {
        NotifCode: NotificationCodeMapping['USER_APPROVAL'],
        DestinationEmail: [].concat(SupervisorEmails),
        Body: {},
      };
      this.notificationServicesController.sendNotification(sendNotificationObj);
      return { messageCode: ResponseMappings['USER_REGISTERED'] };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async attachRolesToUserFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body, user }: any = request;
    try {
      log.info('---attachRolesToUserFunction.body---');
      log.info(body);

      log.info('---attachRolesToUserFunction.user---');
      log.info(user);

      if (!body.RoleID?.length) return { messageCode: ResponseMappings['BAD_REQUEST'] };

      const createUserRoles: UserRoles[] = [];
      body.RoleID.forEach((val: any) => {
        const obj: any = {
          UserID: body.UserID,
          RoleID: val,
          Status: STATUS.ACTIVE,
        };
        createUserRoles.push(obj);
      });

      const [createUserRoleError, createUserRole]: any[] = await Utils.executePromise(
        this.userRolesRepository.createAll(createUserRoles),
      );
      if (createUserRoleError) {
        log.info('---createUserRoleError---');
        log.info(createUserRoleError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      }
      log.info('---createUserRole---');
      log.info(createUserRole);
      return { messageCode: ResponseMappings['UPDATE_SUCCESS'], data: {} };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async fetchUserDetails(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { query }: any = request;
    try {
      log.info('---fetchUserDetails.query---');
      log.info(query);
      const userFilter: Filter = {
        where: {
          UserID: parseInt(query.UserID),
        },
        include: [
          {
            relation: 'user_roles',
            scope: {
              where: {
                Status: STATUS.ACTIVE,
              },
              include: [
                {
                  relation: 'role',
                  scope: {
                    where: {
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
                  },
                },
              ],
            },
          },
        ],
      };
      const [userError, userDetails]: any[] = await Utils.executePromise(
        this.userRepository.findOne(userFilter),
      );
      if (userError) {
        log.info('---userError---');
        log.info(userError);
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      } else if (!userDetails) {
        log.info('---!userDetails---');
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---userDetails---');
      log.info(userDetails);
      const resp: any = {
        Name: userDetails.Name,
        Email: userDetails.Email,
        MobileNumber: userDetails.MobileNumber,
        Address: userDetails.Address,
        CountryCode: userDetails.CountryCode,
        roles: [],
      };
      if (userDetails.user_roles?.length) {
        userDetails.user_roles.forEach((val: any) => {
          const obj: any = {
            RoleID: val.role.RoleID,
            RoleCode: val.role.RoleCode,
            RoleName: val.role.RoleName,
            RoleDescription: val.role.RoleDescription,
            RoleType: val.role.RoleType,
            SupervisorRoleID: val.role.SupervisorRoleID,
            AccessRights: [],
          };
          if (val?.role?.role_access_rights?.length) {
            val.role.role_access_rights.forEach((elem: any) => {
              if (elem.access_rights) {
                obj.AccessRights.push({
                  AccessRightID: elem.access_rights.AccessRightID,
                  AccessRightCode: elem.access_rights.AccessRightCode,
                  AccessRightName: elem.access_rights.AccessRightName,
                  AccessRightDescription: elem.access_rights.AccessRightDescription,
                  AccessRightType: elem.access_rights.Type,
                });
              }
            });
          }
          resp.roles.push(obj);
        });
      }
      return {
        messageCode: ResponseMappings['SUCCESSFUL_FETCH'],
        data: { ...resp },
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async forgotPassword(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    try {
      log.info('---forgotPassword.body---');
      log.info(body);

      const filter: Filter = {
        where: {
          Email: body.Email,
          Status: STATUS.ACTIVE,
        },
      };
      const [userError, userDetails]: any[] = await Utils.executePromise(
        this.userRepository.findOne(filter),
      );
      if (userError) {
        log.info('---forgotPassword.userError---');
        log.info(userError);
        return { messageCode: ResponseMappings['SERVICE_UNAVAILABLE'] };
      } else if (!userDetails) {
        log.info('---!forgotPassword.userDetails---');
        return { messageCode: ResponseMappings['INVALID_CREDENTIALS'] };
      }
      log.info('---forgotPassword.userDetails---');
      log.info(userDetails);

      const sendNotificationObj: InterfaceList.NotificationFunction = {
        NotifCode: NotificationCodeMapping['FORGOT_PASSWORD'],
        DestinationEmail: [].concat(body.Email),
        Body: {
          URL: `${Urls.ForgotPasswordUrl}${userDetails.UserID}`,
        },
      };
      this.notificationServicesController.sendNotification(sendNotificationObj);

      return { messageCode: ResponseMappings['INSTANCE_CREATION_SUCCESS'] };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async completeForgotPasswordFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    try {
      log.info('---completeForgotPasswordFunction.body---');
      log.info(body);

      if (body.UserID && body.NewPassword) {
        const updateUserObj: any = {
          Password: await this.passwordHasher.hashPassword(body.NewPassword),
        };
        const [updateUserError, updatedUser]: any[] = await Utils.executePromise(
          this.userRepository.updateById(body.UserID, updateUserObj),
        );
        if (updateUserError) {
          log.info('---completeForgotPasswordFunction.updateUserError---');
          log.info(updateUserError);
          return updateUserError;
        }
        log.info('---completeForgotPasswordFunction.updatedUser---');
        log.info(updatedUser);
        return updatedUser;
      } else {
        log.info('---NEWPASSWORD.NOT.PROVIDED---');
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  @authenticate(JWT_STRATEGY_NAME)
  public async confirmRegistrationFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    try {
      log.info('---confirmregistration.body---');
      log.info(body);

      if (body.UserID && body.Email && body.Status) {
        const updateUserObj: { Status: string } = {
          Status: body.Status ? body.Status : STATUS.PENDING,
        };
        const [updateUserError, updatedUser]: any[] = await Utils.executePromise(
          this.userRepository.updateById(body.UserID, updateUserObj),
        );
        if (updateUserError) {
          log.info('---confirmregistration.updateUserError---');
          log.info(updateUserError);
          return updateUserError;
        }
        log.info('---confirmregistration.updatedUser---');
        log.info(updatedUser);

        // Send the mail here
        const sendNotificationObj: InterfaceList.NotificationFunction = {
          NotifCode: NotificationCodeMapping['USER_ACTIVATE'],
          DestinationEmail: [].concat(body.Email),
          Body: {
            URL: `${Urls.UserConfirmRegistrationUrl}${body.UserID}`,
          },
        };
        this.notificationServicesController.sendNotification(sendNotificationObj);
        return updatedUser;
      } else {
        log.info('---USERID.NOT.PROVIDED---');
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }

  public async provideCredentialsFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body }: any = request;
    try {
      log.info('---confirmregistration.body---');
      log.info(body);

      if (body?.UserID && body?.NewPassword && body?.Status) {
        const updateUserObj: { Status: string; Password: string } = {
          Status: body.Status,
          Password: await this.passwordHasher.hashPassword(body.NewPassword),
        };
        const [updateUserError, updatedUser]: any[] = await Utils.executePromise(
          this.userRepository.updateById(body.UserID, updateUserObj),
        );
        if (updateUserError) {
          log.info('---confirmregistration.updateUserError---');
          log.info(updateUserError);
          return updateUserError;
        }
        log.info('---confirmregistration.updatedUser---');
        log.info(updatedUser);

        // Send the mail here
        const sendNotificationObj: InterfaceList.NotificationFunction = {
          NotifCode: NotificationCodeMapping['USER_ACTIVATE'],
          DestinationEmail: [].concat(body.Email),
          Body: {
            URL: `${Urls.UserConfirmRegistrationUrl}${body.UserID}`,
          },
        };
        this.notificationServicesController.sendNotification(sendNotificationObj);
        return updatedUser;
      } else {
        log.info('---USERID.OR.PASSWORD.NOT.PROVIDED---');
        return { messageCode: ResponseMappings['BAD_REQUEST'] };
      }
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }
}
