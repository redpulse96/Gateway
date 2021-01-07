import { PasswordHasherBindings } from '../authentication/keys';
import { inject, repository, UserService, Utils } from '../common';
import { InterfaceList, STATUS } from '../constants';
import { PaymentVendor, Users } from '../models';
import { UsersRepository } from '../repositories';
import PasswordHasher from './hash.password.bcryptjs';

export class MyUserService implements UserService<Users, InterfaceList.Credentials> {
  constructor(
    @repository(UsersRepository)
    public userRepository: UsersRepository,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  public async verifyCredentials(credentials: any): Promise<any> {
    const foundUser: any = await this.userRepository.findOne({
      where: {
        or: [
          {
            Email: { like: `%${credentials.email}%` },
            Status: STATUS.ACTIVE,
          },
          {
            Username: { like: `%${credentials.email}%` },
            Status: STATUS.ACTIVE,
          },
        ],
      },
      include: [
        {
          relation: 'payment_vendor',
          scope: {
            include: [
              {
                relation: 'vendor_type',
              },
              {
                relation: 'payment_partner',
                scope: {
                  fields: {
                    PaymentPartnerID: true,
                    PaymentPartnerName: true,
                    PartnerCode: true,
                  },
                },
              },
            ],
          },
        },
      ],
    });
    if (!foundUser) return false;

    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      foundUser.Password,
    );
    if (!passwordMatched) return false;

    if (foundUser?.payment_vendor) {
      const vendorDetails: PaymentVendor = { ...foundUser.payment_vendor };
      foundUser.payment_vendor = {
        VendorCode: vendorDetails.VendorCode,
        Status: vendorDetails.Status,
        vendor_type: vendorDetails.vendor_type
          ? {
              VendorTypeID: vendorDetails.vendor_type.VendorTypeID,
              VendorType: vendorDetails.vendor_type.VendorType,
            }
          : undefined,
        payment_partner: vendorDetails?.payment_vendor?.payment_partner?.length
          ? vendorDetails.payment_vendor.payment_partner
          : undefined,
      };
    }

    return foundUser;
  }

  public convertToUserProfile(user: any): any {
    return {
      UserID: user.UserID,
      Name: user.Name,
      Username: user.Username,
      MobileNumber: user.MobileNumber,
      Email: user.Email,
      isSuperadmin: user.isSuperadmin,
      roles: user.roles,
      payment_vendor: { ...user?.payment_vendor },
      timestamp: Utils.fetchCurrentTimestamp(),
    };
  }
}
