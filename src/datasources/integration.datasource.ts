import { inject, juggler, lifeCycleObserver, LifeCycleObserver, ValueOrPromise } from '../common';
import config from './integration.datasource.config.json';

@lifeCycleObserver('datasource')
export class IntegrationDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'Integration';

  constructor (
    @inject('datasources.config.Integration', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
