import { configuration } from '@/config/configuration';
import { ClientGatewayClient } from '@/datasources/cgw-client';
import { SafesRepository } from '@/domain/safes/safes-repository';
import { logger } from '@/logging/logger';
import Safe from '@safe-global/protocol-kit';
import { TransactionResponse, Wallet, ethers } from 'ethers';

let eoaSigner: Wallet;
let safesRepository: SafesRepository;
let safe: Safe;
let cgw: ClientGatewayClient;

const { privateKeys } = configuration;

beforeAll(async () => {
  eoaSigner = new ethers.Wallet(
    privateKeys[0],
    new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY),
  );

  safesRepository = new SafesRepository(privateKeys[0]);
  safe = await safesRepository.getSafe();
  cgw = new ClientGatewayClient();
});

describe('Transfers: receive native coins from EOA', () => {
  it('should create a transaction and check it is on the CGW history', async () => {
    const safeAddress = await safe.getAddress();
    const safeBalance = await safe.getBalance();

    logger.info({
      msg: 'SAFE_INFO',
      address: safeAddress,
      balance: safeBalance,
      threshold: await safe.getThreshold(),
      owners: await safe.getOwners(),
    });

    const amount = ethers.parseUnits('0.0001', 'ether');
    const tx: TransactionResponse = await eoaSigner.sendTransaction({
      to: safeAddress,
      value: amount,
    });
    logger.info(tx);

    await new Promise((_) => setTimeout(_, 30_000));

    const newBalance = await safe.getBalance();
    logger.info({
      msg: 'SAFE_INFO',
      address: safeAddress,
      balance: newBalance,
      threshold: await safe.getThreshold(),
      owners: await safe.getOwners(),
    });
    expect(newBalance).toEqual(safeBalance + amount);
    const historyTxs = await cgw.getHistory(safeAddress);
    expect(historyTxs.some((i) => i.transaction.id.endsWith(tx.hash.slice(2))));
  }, 60_000);
});
