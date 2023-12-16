import 'dotenv/config';

export const configuration = {
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  walletAddress: process.env.WALLET_ADDRESS as `0x${string}`,
};
