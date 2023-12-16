import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { configuration } from '@/config/configuration';

describe('Wallet actions', () => {
  const [firstWalletClient, secondWalletClient, thirdWalletClient] =
    configuration.privateKeys.map((pk) =>
      createWalletClient({
        account: privateKeyToAccount(pk),
        chain: sepolia,
        transport: http(),
      }),
    );

  describe('should get the account addresses', () => {
    it('should get the first account address', async () => {
      const [account] = await firstWalletClient.getAddresses();
      expect(account).toEqual(configuration.walletAddresses[0]);
    });

    it('should get the second account address', async () => {
      const [account] = await secondWalletClient.getAddresses();
      expect(account).toEqual(configuration.walletAddresses[1]);
    });

    it('should get the third account address', async () => {
      const [account] = await thirdWalletClient.getAddresses();
      expect(account).toEqual(configuration.walletAddresses[2]);
    });
  });
});
