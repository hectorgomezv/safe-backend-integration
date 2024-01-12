import { configuration } from '@/config/configuration';
import { Block, ethers, formatEther, parseUnits } from 'ethers';

describe('Blockchain read-only', () => {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URI);

  it('should get the last block', async () => {
    const block: Block | null = await provider.getBlock('latest');

    expect(block).toMatchObject({
      hash: expect.any(String),
      number: expect.any(Number),
      timestamp: expect.any(Number),
      transactions: expect.arrayContaining([]),
    });
  });

  it.skip('should get the accounts balances', async () => {
    for (const address of configuration.walletAddresses) {
      const balance = await provider.getBalance(address);
      console.log(`ETH on ${address}: ${Number(formatEther(balance))}`);
      expect(Number(parseUnits(formatEther(balance), 'gwei'))).toBeGreaterThan(
        10_000_000,
      ); // 0.01 ETH
    }
  });
});
