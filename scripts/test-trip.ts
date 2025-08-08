import dotenv from 'dotenv';
import { HederaClient, TokenService, TripData } from '../packages/contracts/src';

dotenv.config();

async function testTripReward() {
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY || !process.env.GREEN_TOKEN_ID) {
    console.error('Missing required environment variables: HEDERA_ACCOUNT_ID, HEDERA_PRIVATE_KEY, GREEN_TOKEN_ID');
    process.exit(1);
  }

  const hederaClient = new HederaClient({
    network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet' | 'previewnet') || 'testnet',
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY,
  });

  const tokenService = new TokenService(hederaClient, process.env.GREEN_TOKEN_ID);

  const sampleTrip: TripData = {
    userAccountId: process.env.HEDERA_ACCOUNT_ID,
    startTime: Date.now() - 15 * 60 * 1000, // 15 minutes ago
    endTime: Date.now(),
    distance: 1200, // 1.2km in meters
    avgSpeed: 4.8, // 4.8 km/h
    coordinates: [
      { lat: 40.7128, lng: -74.0060, timestamp: Date.now() - 15 * 60 * 1000 },
      { lat: 40.7138, lng: -74.0050, timestamp: Date.now() - 10 * 60 * 1000 },
      { lat: 40.7148, lng: -74.0040, timestamp: Date.now() - 5 * 60 * 1000 },
      { lat: 40.7158, lng: -74.0030, timestamp: Date.now() },
    ],
    tripType: 'walking'
  };

  try {
    console.log('Testing trip verification and token rewards...');
    console.log(`Trip: ${sampleTrip.tripType} ${sampleTrip.distance}m in ${(sampleTrip.endTime - sampleTrip.startTime) / (1000 * 60)} minutes`);
    
    const result = await tokenService.processTrip(sampleTrip);
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`Tokens earned: ${result.tokensEarned} GREEN`);
      console.log(`Transaction ID: ${result.txId}`);
    } else {
      console.log(` ${result.message}`);
    }

    const invalidTrip: TripData = {
      ...sampleTrip,
      avgSpeed: 25,
      tripType: 'cycling'
    };

    console.log('\n--- Testing invalid trip (too fast) ---');
    const invalidResult = await tokenService.processTrip(invalidTrip);
    console.log(`Result: ${invalidResult.message}`);

  } catch (error) {
    console.error(' Error testing trip:', error);
  } finally {
    hederaClient.close();
  }
}

if (require.main === module) {
  testTripReward();
}