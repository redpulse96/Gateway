import { TokenServiceBindings } from '../authentication/keys';
import { inject, repository, TokenService, UserProfile, util, Utils } from '../common';
import { ResponseMappings, STATUS } from '../constants';
import { AccessTokenRepository } from '../repositories';

const { promisify } = util;
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @repository(AccessTokenRepository)
    private accessTokenRepository: AccessTokenRepository,

    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,

    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
  ) {}

  public async verifyToken(token: string): Promise<UserProfile | any> {
    if (!token) return { success: false, messageCode: ResponseMappings['INVALID_TOKEN'] };

    try {
      const validTokenDetails: any = await this.accessTokenRepository.findOne({
        where: {
          Authorization: token,
          Status: STATUS.ACTIVE,
        },
      });

      if (
        !validTokenDetails ||
        (validTokenDetails?.CreatedAt &&
          Utils.fetchCurrentTimestamp() >
            Utils.addCalculatedTimestamp({
              timestamp: validTokenDetails.CreatedAt,
              offset: validTokenDetails.ExpiresIn,
              unit: 'seconds',
            }))
      ) {
        return { success: false, messageCode: ResponseMappings['INVALID_TOKEN'] };
      }
      const decryptedToken: any = await verifyAsync(token, this.jwtSecret);
      const userProfile: any = {
        UserID: decryptedToken.UserID,
        Name: decryptedToken.Name,
        MobileNumber: decryptedToken.MobileNumber,
        Email: decryptedToken.Email,
        PaymentVendorID: decryptedToken?.PaymentVendorID,
        isSuperadmin: decryptedToken.isSuperadmin,
        Roles: decryptedToken?.roles,
        payment_vendor: decryptedToken?.payment_vendor,
        AccessToken: validTokenDetails,
      };

      // if (decryptedToken?.roles) userProfile.Roles = decryptedToken.roles;
      // if (decryptedToken?.payment_vendor) userProfile.payment_vendor = decryptedToken.payment_vendor;
      return { ...userProfile, success: true };
    } catch (error) {
      return { success: false, messageCode: ResponseMappings['UNAUTHORIZED_ACTION'] };
    }
  }

  public async generateToken(userProfile: UserProfile): Promise<any> {
    if (!userProfile)
      return { success: false, messageCode: ResponseMappings['TOKEN_GENERATION_FAIL'] };

    try {
      const token: string = await signAsync(userProfile, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
      return { token, success: true };
    } catch (error) {
      return { success: false, messageCode: ResponseMappings['TOKEN_GENERATION_FAIL'] };
    }
  }
}
