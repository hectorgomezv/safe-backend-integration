import { configuration } from '@/config/configuration';
import { httpClient } from '@/datasources/axios-http-client';

export interface CGWTransaction {
  type: 'TRANSACTION';
  transaction: {
    id: string;
    timestamp: number;
    txStatus: string;
    txInfo: Record<string, unknown>;
    executionInfo: { nonce: number };
    safeAppInfo: Record<string, unknown>;
  };
}

export class ClientGatewayClient {
  private readonly baseUri: string;

  constructor() {
    this.baseUri = configuration.clientGateway.baseUri;
  }

  async getLiveness(): Promise<{ status: string }> {
    const { data } = await httpClient.get(`${this.baseUri}/health/live`);
    return data;
  }

  async getReadiness(): Promise<{ status: string }> {
    const { data } = await httpClient.get(`${this.baseUri}/health/ready`);
    return data;
  }

  async getAbout(): Promise<{
    name: string;
    version: string | null;
    buildNumber: string | null;
  }> {
    const { data } = await httpClient.get(`${this.baseUri}/about`);
    return data;
  }

  async getHistory(safeAddress: string): Promise<CGWTransaction[]> {
    const { data } = await httpClient.get(
      `${this.baseUri}/v1/chains/11155111/safes/${safeAddress}/transactions/history`,
    );
    return data.results.filter((i) => i.type === 'TRANSACTION');
  }
}
