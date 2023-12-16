import { configuration } from '@/config/configuration';
import { Block, createPublicClient, formatEther, formatGwei, http } from 'viem';
import { sepolia } from 'viem/chains';

describe('Blockchain read-only', () => {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  it('should get the last block', async () => {
    const block: Block = await publicClient.getBlock();

    expect(block).toMatchObject({
      hash: expect.any(String),
      number: expect.any(BigInt),
      size: expect.any(BigInt),
      timestamp: expect.any(BigInt),
      transactions: expect.arrayContaining([]),
    });
  });

  it.skip('should get the accounts balances', async () => {
    for (const address of configuration.walletAddresses) {
      const balance = await publicClient.getBalance({ address });
      console.log(`ETH on ${address}: ${Number(formatEther(balance))}`);
      expect(Number(formatGwei(balance))).toBeGreaterThan(10_000_000); // 0.01 ETH
    }
  });
});
