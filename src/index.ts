import { AzamIntegrationApplication } from './application';
import { ApplicationConfig, rp } from './common';

export { AzamIntegrationApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new AzamIntegrationApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const pingOptions = {
    url: `https://localhost:${options.rest.port}/ping`,
    method: 'GET',
    body: null,
    rejectUnauthorized: false,
  };
  await rp(pingOptions);

  const initiatequeueOptions = {
    url: `https://localhost:${options.rest.port}/initiatequeue`,
    method: 'GET',
    body: null,
    rejectUnauthorized: false,
  };
  await rp(initiatequeueOptions);

  return app;
}
