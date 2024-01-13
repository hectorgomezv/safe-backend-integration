import { ethers } from 'ethers';
import { EthersAdapter } from '@safe-global/protocol-kit';

export const getEthersAdapter = async (): Promise<EthersAdapter> => {
  const provider = new ethers.InfuraProvider(
    'sepolia',
    process.env.INFURA_API_KEY,
  );
  const safeOwner = await provider.getSigner(0);

  return new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });
};
