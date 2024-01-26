import Safe, {
  EthersAdapter,
  SafeAccountConfig,
  SafeFactory,
} from '@safe-global/protocol-kit';
import { Provider, Wallet, ethers } from 'ethers';
import { configuration } from '@/config/configuration';

const { privateKeys } = configuration;
const { INFURA_API_KEY } = process.env;

export class SafesRepository {
  private readonly provider: Provider;
  private readonly adapter: EthersAdapter;
  private readonly signers: Wallet[];

  constructor(privateKey: `0x${string}`) {
    this.provider = new ethers.InfuraProvider('sepolia', INFURA_API_KEY);
    this.adapter = new EthersAdapter({
      ethers,
      signerOrProvider: new ethers.Wallet(privateKey, this.provider),
    });
    this.signers = privateKeys.map((pk) => new Wallet(pk, this.provider));
  }

  async init(): Promise<void> {
    const safeFactory = await SafeFactory.create({ ethAdapter: this.adapter });
    const owners = this.signers.map((s) => s.address);
    const safeAccountConfig: SafeAccountConfig = { owners, threshold: 2 };
    const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);
    const isDeployed = '0x' !== (await this.provider.getCode(safeAddress));

    if (!isDeployed) {
      await this.deploySafe();
    } else {
      console.log(`
        Your Safe is already deployed:
        https://sepolia.etherscan.io/address/${safeAddress}
        https://app.safe.global/sep:${safeAddress}
    `);
    }
  }

  async getSafe(): Promise<Safe> {
    const safeFactory = await SafeFactory.create({ ethAdapter: this.adapter });
    const owners = this.signers.map((s) => s.address);
    const safeAccountConfig: SafeAccountConfig = { owners, threshold: 2 };
    const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);
    return Safe.create({
      ethAdapter: this.adapter,
      safeAddress,
    });
  }

  private async deploySafe(): Promise<Safe> {
    const safeFactory = await SafeFactory.create({
      ethAdapter: this.adapter,
    });
    const owners = await Promise.all(
      this.signers.map(async (s) => s.getAddress()),
    );
    const safeAccountConfig: SafeAccountConfig = { owners, threshold: 2 };
    const safe = await safeFactory.deploySafe({ safeAccountConfig });
    const safeAddress = await safe.getAddress();

    console.log(`
      A NEW Safe has been deployed:
      https://sepolia.etherscan.io/address/${safeAddress}
      https://app.safe.global/sep:${safeAddress}
    `);

    return safe;
  }
}
