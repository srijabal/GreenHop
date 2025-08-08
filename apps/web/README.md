# Hedera DApp - Token Transfer & Association

A clean implementation of a Hedera DApp following the official tutorial for token transfers and associations with WalletConnect and MetaMask support.

## Features

- **Multi-wallet Support**: Connect with WalletConnect or MetaMask
- **Token Management**: View all tokens associated with your account
- **Token Association**: Associate new tokens to your account
- **Token Transfers**: Transfer fungible tokens and NFTs
- **Mirror Node Integration**: Real-time token balance and information queries
- **Material UI**: Clean and responsive user interface

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure WalletConnect:
   - Get a project ID from https://cloud.walletconnect.com/
   - Update `.env.local` with your project ID:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

3. Start the development server:
```bash
npm run dev
```

## Architecture

### Key Components

- **GlobalAppContext**: Manages wallet connection state
- **MirrorNodeClient**: Handles all Mirror Node API queries
- **WalletInterface**: Abstraction for different wallet types
- **Home**: Main UI component for token operations
- **WalletConnection**: Wallet connection management

### File Structure

```
src/
├── components/
│   ├── WalletConnection.tsx    # Wallet connection UI
├── contexts/
│   └── GlobalAppContext.tsx    # Global state management
├── config/
│   └── networks.ts            # Network configurations
├── pages/
│   └── Home.tsx               # Main application UI
├── services/
│   └── wallets/
│       ├── mirrorNodeClient.ts # Mirror Node API client
│       └── walletInterface.ts  # Wallet abstraction layer
```

## Usage

1. **Connect Wallet**: Choose WalletConnect or MetaMask
2. **View Tokens**: See all tokens associated with your account
3. **Associate Token**: Enter a token ID to associate with your account
4. **Transfer Tokens**: 
   - Select a token from your holdings
   - For NFTs: Choose serial number
   - For fungible tokens: Enter amount
   - Enter receiver account ID
   - Sign and send transaction

## Testing

For testing, you can use the Hedera test account helper:

```bash
npx github:/hedera-dev/hedera-create-account-and-token-helper
```

This will create test accounts with tokens for testing transfers and associations.

## Network Configuration

Currently configured for Hedera Testnet. Modify `src/config/networks.ts` for mainnet deployment.

## Dependencies

- **@hashgraph/sdk**: Hedera SDK for transaction building
- **@mui/material**: Material UI components
- **@walletconnect/ethereum-provider**: WalletConnect integration
- **ethers**: Ethereum/EVM compatibility layer
- **Next.js**: React framework
- **TypeScript**: Type safety

## License

MIT License