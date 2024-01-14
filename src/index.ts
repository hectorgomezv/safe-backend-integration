import { configuration } from '@/config/configuration';
import { SafesRepository } from '@/datasources/safes-repository';
import 'dotenv/config';

const { privateKeys } = configuration;

async function main() {
  const repository = new SafesRepository(privateKeys[0]);
  repository.init();
}

(() => main())();
