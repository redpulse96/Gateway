import { reportApi } from '../api-specs/reports-api';
import { api, authenticate, inject, repository, Request, RestBindings } from '../common';
import { InterfaceList, JWT_STRATEGY_NAME, ResponseMappings } from '../constants';
import { AccessTokenRepository, UsersRepository } from '../repositories';

@api(reportApi)
export class ReportsApiController {
  constructor(
    @repository(AccessTokenRepository)
    private accessTokenRepository: AccessTokenRepository,

    @repository(UsersRepository)
    private userRepository: UsersRepository,
  ) {}

  @authenticate(JWT_STRATEGY_NAME)
  public async checkForOriginatorMatchMissingFunction(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body } = request;

    console.log('Atharv is here with body: ' + JSON.stringify(body));

    return { messageCode: ResponseMappings['INVALID_FILE'] };
  }
}
