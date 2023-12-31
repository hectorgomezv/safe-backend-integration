import { httpClient } from '@/datasources/axios-http-client';
import { expect } from '@jest/globals';
import '@/__tests__/matchers/to-be-string-or-null';

describe('CGW status checks', () => {
  const cgwBaseUri = 'https://safe-client.staging.5afe.dev';

  describe('/health endpoints', () => {
    it('should return OK to liveness probe', async () => {
      const { data } = await httpClient.get(`${cgwBaseUri}/health/live`);
      expect(data).toEqual({ status: 'OK' });
    });

    it('should return OK to readiness probe', async () => {
      const { data } = await httpClient.get(`${cgwBaseUri}/health/ready`);
      expect(data).toEqual({ status: 'OK' });
    });
  });

  describe('/about endpoint', () => {
    it('should return the service metadata', async () => {
      const { data } = await httpClient.get(`${cgwBaseUri}/about`);
      expect(data).toMatchObject({
        name: expect.any(String),
        version: expect.anyStringOrNull(),
        buildNumber: expect.anyStringOrNull(),
      });
    });
  });
});
