'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Wallet, ExternalLink, Loader2 } from 'lucide-react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { useGlobalAppContext } from '@/contexts/GlobalAppContext';

export function HederaWalletConnect() {
  const { accountId, isConnected, setAccountId, setIsConnected, setProvider } = useGlobalAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWalletConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const provider = await EthereumProvider.init({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8574f21c5a6d1d30e8a857f9793bdf2e',
        chains: [296], // Hedera Testnet
        rpcMap: {
          296: 'https://testnet.hashio.io/api'
        },
        showQrModal: true
      });

      await provider.enable();
      
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts) {
        const account = accounts[0];
        setAccountId(account);
        setIsConnected(true);
        setProvider(provider);
      }
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      setError('Failed to connect with WalletConnect');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMetaMask = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const ethereum = (window as any).ethereum;
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x128', // 296 in hex
              chainName: 'Hedera Testnet',
              rpcUrls: ['https://testnet.hashio.io/api'],
              nativeCurrency: {
                name: 'HBAR',
                symbol: 'HBAR',
                decimals: 18,
              },
              blockExplorerUrls: ['https://hashscan.io/testnet'],
            }],
          });
        } catch (error) {
          console.log('Network already added or user rejected');
        }

        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts) {
          const account = accounts[0];
          setAccountId(account);
          setIsConnected(true);
          
          setProvider((window as any).ethereum as any);
        }
      } else {
        setError('MetaMask is not installed. Please install MetaMask.');
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setError('Failed to connect with MetaMask');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setAccountId(null);
    setIsConnected(false);
    setProvider(null);
    setError(null);
  };

  if (isConnected && accountId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Wallet Connected</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {accountId.slice(0, 8)}...{accountId.slice(-6)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://hashscan.io/testnet/account/${accountId}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
            <Wallet className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Connect Your Hedera Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with WalletConnect (HashPack, Blade, Kabila) or MetaMask to start tracking trips
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleConnectWalletConnect}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect with WalletConnect
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleConnectMetaMask}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect with MetaMask'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            By connecting, you agree to our terms and conditions
          </p>
        </div>
      </CardContent>
    </Card>
  );
}