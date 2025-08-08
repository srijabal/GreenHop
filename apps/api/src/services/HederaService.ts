import { HederaClient, TokenService } from '../../../../packages/contracts/src';

export class HederaService {
  private static instance: HederaService;
  private hederaClient: HederaClient;
  private tokenService: TokenService;

  private constructor() {
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      throw new Error('Missing required Hedera environment variables');
    }

    this.hederaClient = new HederaClient({
      network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet' | 'previewnet') || 'testnet',
      accountId: process.env.HEDERA_ACCOUNT_ID,
      privateKey: process.env.HEDERA_PRIVATE_KEY,
    });

    this.tokenService = new TokenService(
      this.hederaClient,
      process.env.GREEN_TOKEN_ID
    );
  }

  public static getInstance(): HederaService {
    if (!HederaService.instance) {
      HederaService.instance = new HederaService();
    }
    return HederaService.instance;
  }

  public getTokenService(): TokenService {
    return this.tokenService;
  }

  public getHederaClient(): HederaClient {
    return this.hederaClient;
  }
}