import {
  Client,
  AccountId,
  PrivateKey,
  AccountCreateTransaction,
  AccountInfoQuery,
  TransferTransaction,
  Hbar,
} from '@hashgraph/sdk';
import { HederaConfig } from './types';

export class HederaClient {
  private client: Client;
  private accountId: AccountId;
  private privateKey: PrivateKey;

  constructor(config: HederaConfig) {
    this.accountId = AccountId.fromString(config.accountId);
    this.privateKey = PrivateKey.fromString(config.privateKey);

    switch (config.network) {
      case 'testnet':
        this.client = Client.forTestnet();
        break;
      case 'mainnet':
        this.client = Client.forMainnet();
        break;
      case 'previewnet':
        this.client = Client.forPreviewnet();
        break;
      default:
        throw new Error(`Unsupported network: ${config.network}`);
    }

    this.client.setOperator(this.accountId, this.privateKey);
  }

  getClient(): Client {
    return this.client;
  }

  getAccountId(): AccountId {
    return this.accountId;
  }

  getPrivateKey(): PrivateKey {
    return this.privateKey;
  }

  async getAccountBalance(): Promise<string> {
    try {
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(this.accountId)
        .execute(this.client);
      
      return accountInfo.balance.toString();
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }

  async transferHbar(toAccountId: string, amount: number): Promise<string> {
    try {
      const transferTransaction = new TransferTransaction()
        .addHbarTransfer(this.accountId, new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(toAccountId), new Hbar(amount))
        .freezeWith(this.client);

      const signedTx = await transferTransaction.sign(this.privateKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      return receipt.transactionId?.toString() || '';
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      throw error;
    }
  }

  close(): void {
    this.client.close();
  }
}