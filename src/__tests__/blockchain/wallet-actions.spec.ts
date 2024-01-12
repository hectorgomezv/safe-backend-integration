import { JsonRpcApiProvider, JsonRpcProvider, Wallet, ethers } from 'ethers';
import { configuration } from '@/config/configuration';

const REFILL_THRESHOLD = 1000000000000000; // 0.001 ETH

const getFundedWallet = async (
  provider: JsonRpcApiProvider,
  wallets: Wallet[],
): Promise<Wallet> => {
  for (const wallet of wallets) {
    const address = await wallet.getAddress();
    const ethBalance = await provider.getBalance(address);

    if (ethBalance >= REFILL_THRESHOLD) {
      return wallet;
    }
  }

  throw Error('None of the configured Wallets have enough ETH');
};

describe('Wallet actions', () => {
  const provider = new JsonRpcProvider(process.env.RPC_URI, 'sepolia');
  const wallets = configuration.privateKeys.map(
    (pk) => new Wallet(pk, provider),
  );
  const [firstWallet, secondWallet, thirdWallet] = wallets;

  describe('should get the account addresses', () => {
    it('should get the first account address', async () => {
      expect(firstWallet.address).toEqual(configuration.walletAddresses[0]);
    });

    it('should get the second account address', async () => {
      expect(secondWallet.address).toEqual(configuration.walletAddresses[1]);
    });

    it('should get the third account address', async () => {
      expect(thirdWallet.address).toEqual(configuration.walletAddresses[2]);
    });
  });

  describe('resources allocation', () => {
    it('should get the balances', async () => {
      for (const wallet of wallets) {
        const ethBalance = await provider.getBalance(wallet.address);
        expect(ethBalance).toBeDefined();
        console.log(`${wallet.address} balance: ${ethBalance}`);
      }
    });

    it('should refill a wallet that is almost empty', async () => {
      for (const wallet of wallets) {
        const ethBalance = await provider.getBalance(wallet.address);
        if (ethBalance <= REFILL_THRESHOLD) {
          const fundedWallet = await getFundedWallet(
            provider,
            wallets.filter((w) => w.address !== wallet.address),
          );
          const tx = await fundedWallet.sendTransaction({
            to: wallet.address,
            value: ethers.parseUnits('0.005', 'ether'),
          });
          console.log(
            `Funds sent from ${fundedWallet.address} to ${wallet.address} (txHash: ${tx.hash})`,
          );
        }
      }
    });
  });
});
