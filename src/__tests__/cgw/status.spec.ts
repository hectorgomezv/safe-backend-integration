import { httpClient } from '@/datasources/axios-http-client';
import { expect } from '@jest/globals';
import '@/__tests__/matchers/to-be-string-or-null';

describe('Math functions', () => {
  const cgwBaseUri = 'https://safe-client.staging.5afe.dev';

  it('/health/live should return OK', async () => {
    const { data } = await httpClient.get(`${cgwBaseUri}/health/live`);
    expect(data).toEqual({ status: 'OK' });
  });

  it('/health/ready should return OK', async () => {
    const { data } = await httpClient.get(`${cgwBaseUri}/health/ready`);
    expect(data).toEqual({ status: 'OK' });
  });

  it('/about should return the service metadata', async () => {
    const { data } = await httpClient.get(`${cgwBaseUri}/about`);
    expect(data).toMatchObject({
      name: expect.any(String),
      version: expect.anyStringOrNull(),
      buildNumber: expect.anyStringOrNull(),
    });
  });
});
