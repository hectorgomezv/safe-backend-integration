import Safe, {
  EthersAdapter,
  SafeAccountConfig,
  SafeFactory,
} from '@safe-global/protocol-kit';

export class SafesRepository {
  private ethersAdapter: EthersAdapter;

  constructor(ethersAdapter: EthersAdapter) {
    this.ethersAdapter = ethersAdapter;
  }

  async getSafe(): Promise<Safe> {
    try {
      const safeFactory = await SafeFactory.create({
        ethAdapter: this.ethersAdapter,
        safeVersion: '1.4.1',
      });

      const safeAccountConfig: SafeAccountConfig = {
        owners: [
          process.env.WALLET_ADDRESS!,
          process.env.SECOND_WALLET_ADDRESS!,
          process.env.THIRD_WALLET_ADDRESS!,
        ],
        threshold: 2,
      };

      return await safeFactory.deploySafe({ safeAccountConfig });
    } catch (err) {
      throw err; // debugging purposes
    }
  }
}
