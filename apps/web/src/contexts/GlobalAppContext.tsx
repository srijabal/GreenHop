'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';

interface GlobalAppContextType {
  accountId: string | null;
  setAccountId: (accountId: string | null) => void;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  provider: EthereumProvider | null;
  setProvider: (provider: EthereumProvider | null) => void;
}

const GlobalAppContext = createContext<GlobalAppContextType | undefined>(undefined);

export const useGlobalAppContext = () => {
  const context = useContext(GlobalAppContext);
  if (context === undefined) {
    throw new Error('useGlobalAppContext must be used within a GlobalAppContextProvider');
  }
  return context;
};

interface GlobalAppContextProviderProps {
  children: ReactNode;
}

export const GlobalAppContextProvider: React.FC<GlobalAppContextProviderProps> = ({ children }) => {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [provider, setProvider] = useState<EthereumProvider | null>(null);

  return (
    <GlobalAppContext.Provider
      value={{
        accountId,
        setAccountId,
        isConnected,
        setIsConnected,
        provider,
        setProvider,
      }}
    >
      {children}
    </GlobalAppContext.Provider>
  );
};