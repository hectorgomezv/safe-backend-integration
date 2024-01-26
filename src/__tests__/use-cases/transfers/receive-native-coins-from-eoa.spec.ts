import { configuration } from '@/config/configuration';
import { SafesRepository } from '@/datasources/safes-repository';
import Safe from '@safe-global/protocol-kit';
import { TransactionResponse, Wallet, ethers } from 'ethers';

let eoaSigner: Wallet;
let safesRepository: SafesRepository;
let safe: Safe;

const { privateKeys } = configuration;

beforeAll(async () => {
  eoaSigner = new ethers.Wallet(
    privateKeys[0],
    new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY),
  );

  safesRepository = new SafesRepository(privateKeys[0]);
  safe = await safesRepository.getSafe();
});

describe.skip('Transfers: receive native coins from EOA', () => {
  it('should create a transaction and check it is on CGW queue', async () => {
    const balance = await safe.getBalance();
    const t = await safe.getThreshold();
    const o = await safe.getOwners();
    console.log(balance, t, o);

    const safeAddress = await safe.getAddress();
    const tx: TransactionResponse = await eoaSigner.sendTransaction({
      to: safeAddress,
      value: ethers.parseUnits('0.0001', 'ether'),
    });
    const nonce = tx.nonce;
    nonce; // TODO: check the tx with this nonce is on the CGW queue after some seconds.

    console.log(tx);
    const balance2 = await safe.getBalance();
    console.log(balance2, t, o);
  });
});
