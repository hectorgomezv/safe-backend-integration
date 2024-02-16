import { configuration } from '@/config/configuration';
import {
  CGWProposeTransactionDTO,
  CGWTransactionItem,
  ClientGatewayClient,
} from '@/datasources/cgw-client';
import { SafesRepository } from '@/domain/safes/safes-repository';
import Safe from '@safe-global/protocol-kit';
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types';
import { TransactionResponse, Wallet, ethers } from 'ethers';
import { faker } from '@faker-js/faker';
import SafeApiKit from '@safe-global/api-kit';

let eoaSigner: Wallet;
let safesRepository: SafesRepository;
let safesRepository2: SafesRepository;
let safe: Safe;
let safe2: Safe;
let cgw: ClientGatewayClient;
let apiKit: SafeApiKit;

const { privateKeys, transactionService } = configuration;

/**
 * Safe Transaction Service ids include transaction hashes as postfix:
 * https://github.com/safe-global/safe-transaction-service/blob/f6d6fe95388620a149b4bc183ed480e54920f5e4/safe_transaction_service/history/serializers.py#L853
 *
 * These transaction hashes don't include hex '0x' prefix, so it's being sliced.
 */
function _findTransaction(
  transactions: CGWTransactionItem[],
  txHash: string,
): CGWTransactionItem | undefined {
  return transactions.find((i) => i.transaction.id.endsWith(txHash.slice(2)));
}

function _containsTransaction(
  transactions: CGWTransactionItem[],
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
  apiKit = new SafeApiKit({
    chainId: BigInt(1),
    txServiceUrl: transactionService.baseUri,
  });
  eoaSigner = new ethers.Wallet(
    privateKeys[0],
    new ethers.InfuraProvider('sepolia', process.env.INFURA_API_KEY),
  );

  safesRepository = new SafesRepository(privateKeys[0]);
  safesRepository2 = new SafesRepository(privateKeys[1]);
  safe = await safesRepository.getSafe();
  safe2 = await safesRepository2.getSafe();
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
    'should propose an ether transfer, check queue, and delete the proposed transaction',
  );

  it('should propose an ether transfer, check queue, sign, execute, and check history', async () => {
    const amount = ethers.parseUnits(
      faker.number
        .float({ min: 0.00001, max: 0.0001, fractionDigits: 12 })
        .toString(),
      'ether',
    );
    const txData: MetaTransactionData = {
      to: configuration.walletAddresses[1],
      data: '0x',
      value: amount.toString(),
    };
    const tx = await safe.createTransaction({
      transactions: [txData],
    });
    const safeTxHash = await safe.getTransactionHash(tx);
    const firstSignature = await safe.signTransactionHash(safeTxHash);
    const safeAddress = await safe.getAddress();
    const sender = await eoaSigner.getAddress();
    const { recommendedNonce } = await cgw.getNonces(safeAddress);
    const proposeTransactionDto: CGWProposeTransactionDTO = {
      to: tx.data.to,
      value: tx.data.value,
      data: tx.data.data,
      nonce: recommendedNonce.toString(),
      operation: tx.data.operation,
      safeTxGas: tx.data.safeTxGas,
      baseGas: tx.data.baseGas,
      gasPrice: tx.data.gasPrice,
      gasToken: tx.data.gasToken,
      refundReceiver: tx.data.refundReceiver,
      safeTxHash: safeTxHash,
      sender: sender,
      signature: firstSignature.data,
    };

    await cgw.postTransaction(safeAddress, proposeTransactionDto);

    // Check the CGW queue contains the transaction
    await seconds(10);
    const queueBeforeExecution = await cgw.getQueue(safeAddress);
    expect(_containsTransaction(queueBeforeExecution, safeTxHash)).toBe(true);

    // Add a second signature
    const secondSignature = await safe2.signTransactionHash(safeTxHash);
    await cgw.postConfirmation(safeTxHash, secondSignature);

    // Execute the transaction
    const safeTransaction = await apiKit.getTransaction(safeTxHash);
    const executeTxResponse = await safe.executeTransaction(safeTransaction);
    await executeTxResponse.transactionResponse?.wait();

    // Check the CGW history contains the transaction
    await seconds(10);
    const historyTxs = await cgw.getHistory(safeAddress);
    expect(_containsTransaction(historyTxs, safeTxHash)).toBe(true);

    // Check the CGW queue does not contain the transaction anymore
    const queueAfterExecution = await cgw.getQueue(safeAddress);
    expect(_containsTransaction(queueAfterExecution, safeTxHash)).toBe(false);
  }, 60_000);
});
