import dotenv from 'dotenv';
import { HederaClient, TokenService } from '../packages/contracts/src';

dotenv.config();

async function createGreenToken() {
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    console.error('Missing required environment variables: HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY');
    process.exit(1);
  }

  const hederaClient = new HederaClient({
    network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet' | 'previewnet') || 'testnet',
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY,
  });

  const tokenService = new TokenService(hederaClient);

  try {
    console.log('Creating GREEN token...');
    
    const tokenId = await tokenService.createGreenToken({
      name: 'GreenHop Sustainability Token',
      symbol: 'GREEN',
      decimals: 0,
      initialSupply: 1000000,
      treasuryAccountId: process.env.HEDERA_ACCOUNT_ID,
    });

    console.log(`✅ GREEN token created successfully!`);
    console.log(`Token ID: ${tokenId}`);
    console.log(`\nAdd this to your .env file:`);
    console.log(`GREEN_TOKEN_ID=${tokenId}`);
    
    const balance = await hederaClient.getAccountBalance();
    console.log(`Treasury account balance: ${balance}`);

  } catch (error) {
    console.error('Error creating token:', error);
  } finally {
    hederaClient.close();
  }
}

if (require.main === module) {
  createGreenToken();
}