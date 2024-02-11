import { configuration } from '@/config/configuration';
import { CGWTransaction, ClientGatewayClient } from '@/datasources/cgw-client';
import { SafesRepository } from '@/domain/safes/safes-repository';
import Safe from '@safe-global/protocol-kit';
import { TransactionResponse, Wallet, ethers } from 'ethers';

let eoaSigner: Wallet;
let safesRepository: SafesRepository;
let safe: Safe;
let cgw: ClientGatewayClient;

const { privateKeys } = configuration;

/**
 * Safe Transaction Service ids include transaction hashes as postfix:
 * https://github.com/safe-global/safe-transaction-service/blob/f6d6fe95388620a149b4bc183ed480e54920f5e4/safe_transaction_service/history/serializers.py#L853
 *
 * These transaction hashes don't include hex '0x' prefix, so it's being sliced.
 */
function _findTransaction(
  transactions: CGWTransaction[],
  txHash: string,
): CGWTransaction | undefined {
  return transactions.find((i) => i.transaction.id.endsWith(txHash.slice(2)));
}

function _containsTransaction(
  transactions: CGWTransaction[],
  txHash: string,
): boolean {
  return !!_findTransaction(transactions, txHash);
}

/**
 * Stops execution for {@link milliseconds} milliseconds.
 */
async function milliseconds(milliseconds: number): Promise<void> {
  await new Promise((_) => setTimeout(_, milliseconds));
}

/**
 * Stops execution for {@link seconds} seconds.
 */
async function seconds(seconds: number): Promise<void> {
  return milliseconds(seconds * 1000);
}

beforeAll(async () => {
  eoaSigner = new ethers.Wallet(
    privateKeys[0],
    new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY),
  );

  safesRepository = new SafesRepository(privateKeys[0]);
  safe = await safesRepository.getSafe();
  cgw = new ClientGatewayClient();
});

describe('Transfers: receive/send native coins from/to EOA', () => {
  it('should receive an ether transfer and check it is on the CGW history', async () => {
    const safeAddress = await safe.getAddress();
    const safeBalance = await safe.getBalance();
    const amount = ethers.parseUnits('0.0001', 'ether');

    const tx: TransactionResponse = await eoaSigner.sendTransaction({
      to: safeAddress,
      value: amount,
    });
    await seconds(30);

    const historyTxs = await cgw.getHistory(safeAddress);
    const newBalance = await safe.getBalance();
    expect(_containsTransaction(historyTxs, tx.hash)).toBe(true);
    expect(newBalance).toEqual(safeBalance + amount);
  }, 60_000);

  it.todo(
    'should propose an ether transfer, enqueue it, sign it, execute it and check it is in history',
  );
});
