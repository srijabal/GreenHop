import { AccountId, PrivateKey, TokenId, TransferTransaction, TokenAssociateTransaction } from "@hashgraph/sdk";
import { ethers } from "ethers";
import EthereumProvider from '@walletconnect/ethereum-provider';

export interface WalletInterface {
  executeTransaction(transaction: TransferTransaction | TokenAssociateTransaction): Promise<any>;
  getAccountId(): AccountId | null;
  getAccountKey(): PrivateKey | null;
}

export class MetamaskWallet implements WalletInterface {
  private provider: EthereumProvider;
  private accountId: AccountId | null = null;
  
  constructor(provider: EthereumProvider, accountId: string) {
    this.provider = provider;
    this.accountId = AccountId.fromString(accountId);
  }

  async executeTransaction(transaction: TransferTransaction | TokenAssociateTransaction): Promise<any> {
    // Convert Hedera transaction to Ethereum transaction
    const transactionBytes = transaction.toBytes();
    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const signer = await ethersProvider.getSigner();
    
    // Send the transaction
    const txHash = await signer.sendTransaction({
      data: `0x${Buffer.from(transactionBytes).toString('hex')}`
    });
    
    return txHash;
  }

  getAccountId(): AccountId | null {
    return this.accountId;
  }

  getAccountKey(): PrivateKey | null {
    // MetaMask doesn't expose private keys
    return null;
  }
}