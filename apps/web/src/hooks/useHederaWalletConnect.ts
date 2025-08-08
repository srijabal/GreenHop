'use client';

import { useGlobalAppContext } from '@/contexts/GlobalAppContext';

export function useHederaWalletConnect() {
  const { accountId, isConnected, provider } = useGlobalAppContext();

  return {
    walletState: {
      accountId,
      isConnected,
      provider
    }
  };
}