import { Filter, inject, repository, Request, RestBindings, Utils } from '../common';
import { InterfaceList, ResponseMappings, STATUS } from '../constants';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { QuestionAnswersRepository } from '../repositories';

const log = new LoggingInterceptor('transactions.Controllers');

export class QuestionAnswersController {
  constructor(
    @repository(QuestionAnswersRepository)
    public questionAnswersRepository: QuestionAnswersRepository,
  ) {}

  async fetchAnswersFromQuestionCode(
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<InterfaceList.GlobalDefaultResponse> {
    const { body, query }: any = request;
    try {
      log.info('---fetchAnswersFromQuestionCode.body---');
      log.info(body);

      log.info('---fetchAnswersFromQuestionCode.query---');
      log.info(query);

      const questionAnswersFilter: Filter = {
        where: {
          QuestionCode: query.QuestionCode,
          Status: STATUS.ACTIVE,
        },
      };
      const [
        questionAnswersError,
        questionAnswers,
      ]: any[] = await this.questionAnswersRepository.find(questionAnswersFilter);
      if (questionAnswersError || !questionAnswers?.length) {
        log.info('---questionAnswersError---');
        log.info(questionAnswersError);
        log.info(questionAnswers);
        return { messageCode: ResponseMappings['EMPTY_RESPONSE'] };
      }
      log.info('---questionAnswers---');
      log.info(questionAnswers);
      const resp: any = {};
      questionAnswers.forEach((val: any) => {
        resp[val.Question]
          ? resp[val.Question].push(val.Answer)
          : (resp[val.Question] = [val.Answer]);
      });
      return {
        messageCode: ResponseMappings['EMPTY_RESPONSE'],
        data: resp,
      };
    } catch (error) {
      return Utils.catchReturn(error);
    }
  }
}
