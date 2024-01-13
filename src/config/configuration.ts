import 'dotenv/config';

export const configuration = {
  privateKeys: [
    process.env.PRIVATE_KEY as `0x${string}`,
    process.env.SECOND_PRIVATE_KEY as `0x${string}`,
    process.env.THIRD_PRIVATE_KEY as `0x${string}`,
  ],
  rpc: {
    apiKey: process.env.INFURA_API_KEY,
  },
  walletAddresses: [
    process.env.WALLET_ADDRESS as `0x${string}`,
    process.env.SECOND_WALLET_ADDRESS as `0x${string}`,
    process.env.THIRD_WALLET_ADDRESS as `0x${string}`,
  ],
};
