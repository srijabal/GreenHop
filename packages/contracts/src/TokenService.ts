import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  AccountId,
  TokenId,
  PrivateKey,
} from '@hashgraph/sdk';
import { HederaClient } from './HederaClient';
import { TokenConfig, TokenMintRequest, TripData, VerificationResult } from './types';

export class TokenService {
  private hederaClient: HederaClient;
  private tokenId?: TokenId;

  constructor(hederaClient: HederaClient, tokenId?: string) {
    this.hederaClient = hederaClient;
    if (tokenId) {
      this.tokenId = TokenId.fromString(tokenId);
    }
  }

  async createGreenToken(config: TokenConfig): Promise<string> {
    try {
      const client = this.hederaClient.getClient();
      const treasuryKey = this.hederaClient.getPrivateKey();
      const treasuryId = this.hederaClient.getAccountId();

      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(config.name)
        .setTokenSymbol(config.symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(config.decimals)
        .setInitialSupply(config.initialSupply)
        .setTreasuryAccountId(treasuryId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setAdminKey(treasuryKey.publicKey)
        .setSupplyKey(treasuryKey.publicKey)
        .freezeWith(client);

      const signedTx = await tokenCreateTx.sign(treasuryKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      if (receipt.tokenId) {
        this.tokenId = receipt.tokenId;
        console.log(`GREEN token created with ID: ${receipt.tokenId.toString()}`);
        return receipt.tokenId.toString();
      }
      
      throw new Error('Token creation failed');
    } catch (error) {
      console.error('Error creating GREEN token:', error);
      throw error;
    }
  }

  async associateTokenWithAccount(accountId: string, accountKey: PrivateKey): Promise<void> {
    if (!this.tokenId) {
      throw new Error('Token ID not set. Create token first or provide token ID in constructor.');
    }

    try {
      const client = this.hederaClient.getClient();
      
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([this.tokenId])
        .freezeWith(client);

      const signedTx = await associateTx.sign(accountKey);
      const txResponse = await signedTx.execute(client);
      await txResponse.getReceipt(client);
      
      console.log(`Token ${this.tokenId.toString()} associated with account ${accountId}`);
    } catch (error) {
      console.error('Error associating token:', error);
      throw error;
    }
  }

  async mintTokens(amount: number, memo?: string): Promise<string> {
    if (!this.tokenId) {
      throw new Error('Token ID not set');
    }

    try {
      const client = this.hederaClient.getClient();
      const supplyKey = this.hederaClient.getPrivateKey();

      const mintTx = new TokenMintTransaction()
        .setTokenId(this.tokenId)
        .setAmount(amount)
        .freezeWith(client);

      if (memo) {
        mintTx.setTransactionMemo(memo);
      }

      const signedTx = await mintTx.sign(supplyKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      console.log(`Minted ${amount} GREEN tokens`);
      return receipt.transactionId?.toString() || '';
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  async transferTokens(toAccountId: string, amount: number): Promise<string> {
    if (!this.tokenId) {
      throw new Error('Token ID not set');
    }

    try {
      const client = this.hederaClient.getClient();
      const treasuryId = this.hederaClient.getAccountId();
      const treasuryKey = this.hederaClient.getPrivateKey();

      const transferTx = new TransferTransaction()
        .addTokenTransfer(this.tokenId, treasuryId, -amount)
        .addTokenTransfer(this.tokenId, AccountId.fromString(toAccountId), amount)
        .freezeWith(client);

      const signedTx = await transferTx.sign(treasuryKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      console.log(`Transferred ${amount} GREEN tokens to ${toAccountId}`);
      return receipt.transactionId?.toString() || '';
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  verifyTripAndCalculateRewards(tripData: TripData): VerificationResult {
    const { distance, avgSpeed, startTime, endTime, coordinates } = tripData;
    const duration = (endTime - startTime) / (1000 * 60);

    const MIN_DURATION = 5;
    const MAX_SPEED = 15;
    const MIN_DISTANCE = 500;

    if (duration < MIN_DURATION) {
      return {
        isValid: false,
        greenTokensEarned: 0,
        reason: `Trip duration ${duration.toFixed(1)} minutes is less than minimum ${MIN_DURATION} minutes`
      };
    }

    if (avgSpeed > MAX_SPEED) {
      return {
        isValid: false,
        greenTokensEarned: 0,
        reason: `Average speed ${avgSpeed.toFixed(1)} km/h exceeds maximum ${MAX_SPEED} km/h`
      };
    }

    if (distance < MIN_DISTANCE) {
      return {
        isValid: false,
        greenTokensEarned: 0,
        reason: `Distance ${distance}m is less than minimum ${MIN_DISTANCE}m`
      };
    }

    if (coordinates.length < 2) {
      return {
        isValid: false,
        greenTokensEarned: 0,
        reason: 'Insufficient GPS coordinates for verification'
      };
    }

    const distanceInKm = distance / 1000;
    const baseReward = Math.floor(distanceInKm);
    
    const multiplier = tripData.tripType === 'cycling' ? 1.5 : 1;
    const totalReward = Math.floor(baseReward * multiplier);

    return {
      isValid: true,
      greenTokensEarned: totalReward,
      reason: `Valid ${tripData.tripType} trip: ${distance}m in ${duration.toFixed(1)} minutes at ${avgSpeed.toFixed(1)} km/h`
    };
  }

  async processTrip(tripData: TripData): Promise<{ success: boolean; txId?: string; tokensEarned: number; message: string }> {
    try {
      const verification = this.verifyTripAndCalculateRewards(tripData);
      
      if (!verification.isValid) {
        return {
          success: false,
          tokensEarned: 0,
          message: verification.reason || 'Trip verification failed'
        };
      }

      await this.mintTokens(verification.greenTokensEarned, `Trip reward: ${tripData.tripType}`);

      const txId = await this.transferTokens(tripData.userAccountId, verification.greenTokensEarned);

      return {
        success: true,
        txId,
        tokensEarned: verification.greenTokensEarned,
        message: `Successfully rewarded ${verification.greenTokensEarned} GREEN tokens for ${tripData.tripType} trip`
      };
    } catch (error) {
      console.error('Error processing trip:', error);
      return {
        success: false,
        tokensEarned: 0,
        message: `Error processing trip: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getTokenId(): string | undefined {
    return this.tokenId?.toString();
  }
}