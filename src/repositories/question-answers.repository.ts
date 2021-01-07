import {DefaultCrudRepository} from '@loopback/repository';
import {QuestionAnswers, QuestionAnswersRelations} from '../models';
import {IntegrationDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class QuestionAnswersRepository extends DefaultCrudRepository<
  QuestionAnswers,
  typeof QuestionAnswers.prototype.QuestionAnswerID,
  QuestionAnswersRelations
> {
  constructor(
    @inject('datasources.Integration') dataSource: IntegrationDataSource,
  ) {
    super(QuestionAnswers, dataSource);
  }
}
