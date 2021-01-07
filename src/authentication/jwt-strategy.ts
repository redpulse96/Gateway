import {
  AuthenticationStrategy,
  inject,
  Request,
  RestBindings,
  TokenService,
  UserProfile,
} from '../common';
import { ApiAccess, JWT_STRATEGY_NAME, ResponseMappings, STATUS } from '../constants';
import { TokenServiceBindings } from './keys';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  public name: string = JWT_STRATEGY_NAME;

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
  ) {}

  async authenticate(
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<UserProfile | undefined> {
    const token: any = this.extractCredentials(request);
    if (!token.success) return token;
    const userProfile: UserProfile = await this.tokenService.verifyToken(token.token);
    if (!userProfile.success) return userProfile;
    request.user = { ...userProfile };
    const module = request.path.split('/')[2] ? request.path.split('/')[2] : null;
    const path = request.path.split('/')[3] ? request.path.split('/')[3] : null;

    const auditLogs: any = {
      UserID: userProfile.UserID,
      Name: userProfile.Name,
      Email: userProfile.Email,
      MobileNumber: userProfile.MobileNumber,
      Method: request.method,
      Path: request.path,
      Action: `${module}_${path}`,
      Operation: path ? path : null,
      ModuleName: module ? module : null,
      AccessRightName: ApiAccess[`${module}_${path}`]?.AccessRights?.AccessRight,
      ApiHeaders: request.headers,
      Apibody: request.body || request.query || {},
      Status: STATUS.ACTIVE,
    };
    request.user = {
      ...request.user,
      auditLogs: { ...auditLogs },
    };
    return userProfile;
  }

  public extractCredentials(@inject(RestBindings.Http.REQUEST) request: Request): any {
    if (!request.headers.authorization)
      return { success: false, messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };

    // for example: Bearer xxx.yyy.zzz
    const authHeaderValue: string = request.headers.authorization;
    if (!authHeaderValue.startsWith('Bearer'))
      return { success: false, messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };

    //split the string into 2 parts: 'Bearer ' and the `xxx.yyy.zzz`
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      return { success: false, messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };

    const token = parts[1];
    return { token, success: true };
  }
}
