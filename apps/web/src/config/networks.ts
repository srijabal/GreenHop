export const networks = {
  testnet: {
    chainId: '0x128',
    name: 'Hedera Testnet',
    rpcUrls: ['https://testnet.hashio.io/api'],
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18,
    },
    blockExplorerUrls: ['https://hashscan.io/testnet'],
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com'
  },
  mainnet: {
    chainId: '0x127',
    name: 'Hedera Mainnet',
    rpcUrls: ['https://mainnet.hashio.io/api'],
    nativeCurrency: {
      name: 'HBAR',
      symbol: 'HBAR',
      decimals: 18,
    },
    blockExplorerUrls: ['https://hashscan.io/mainnet'],
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com'
  }
}

export const appConfig = {
  networks
}