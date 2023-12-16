import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { configuration } from '@/config/configuration';

describe('Wallet actions', () => {
  const account = privateKeyToAccount(configuration.privateKey);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });

  it('should get the account addresses', async () => {
    const accounts = await client.getAddresses();
    expect(accounts).toEqual([configuration.walletAddress]);
  });
});
