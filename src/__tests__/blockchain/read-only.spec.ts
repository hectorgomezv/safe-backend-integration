import { configuration } from '@/config/configuration';
import { Block, createPublicClient, http, parseGwei } from 'viem';
import { sepolia } from 'viem/chains';

describe('Blockchain read-only', () => {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  it('should get the last block', async () => {
    const block: Block = await client.getBlock();
    expect(block).toMatchObject({
      hash: expect.any(String),
      number: expect.any(BigInt),
      size: expect.any(BigInt),
      timestamp: expect.any(BigInt),
      transactions: expect.arrayContaining([]),
    });
  });

  it('should get the account balance', async () => {
    const balance = await client.getBalance({
      address: configuration.walletAddress,
    });
    expect(balance).toBeGreaterThan(parseGwei(`${10_000_000}`)); // 0.01 ETH
  });
});
