import { Block, createPublicClient, http } from 'viem';
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
});
