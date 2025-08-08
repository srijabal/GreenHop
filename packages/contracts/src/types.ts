import { AccountId, PrivateKey, TokenId } from '@hashgraph/sdk';

export interface HederaConfig {
  network: 'testnet' | 'mainnet' | 'previewnet';
  accountId: string;
  privateKey: string;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  treasuryAccountId: string;
  adminKey?: PrivateKey;
  supplyKey?: PrivateKey;
}

export interface TripData {
  userAccountId: string;
  startTime: number;
  endTime: number;
  distance: number; // in meters
  avgSpeed: number; // in km/h
  coordinates: {
    lat: number;
    lng: number;
    timestamp: number;
  }[];
  tripType: 'walking' | 'cycling';
}

export interface VerificationResult {
  isValid: boolean;
  greenTokensEarned: number;
  reason?: string;
}

export interface TokenMintRequest {
  userAccountId: string;
  amount: number;
  memo?: string;
}