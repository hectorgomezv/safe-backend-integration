import 'dotenv/config';
import { getEthersAdapter } from './datasources/ethers-adapter';
import { SafesRepository } from './datasources/safes-repository';

async function main() {
  const ethersAdapter = await getEthersAdapter();
  const safesRepository: SafesRepository = new SafesRepository(ethersAdapter);
  const safe = safesRepository.getSafe();
  console.log(safe);
}

(() => main())();
