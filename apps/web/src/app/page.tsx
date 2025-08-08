'use client'

import { useState } from 'react'
import { HederaWalletConnect } from '@/components/HederaWalletConnect'
import { TripTracker } from '@/components/TripTracker'
import { Dashboard } from '@/components/Dashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GlobalAppContextProvider } from '@/contexts/GlobalAppContext'
import { 
  Leaf, 
  MapPin, 
  Coins, 
  TrendingUp,
  Menu
} from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'track' | 'dashboard'>('track')

  return (
    <GlobalAppContextProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <img src="/logo.png" alt="GreenHop Logo" width={32} height={32} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">GreenHop</h1>
                  <p className="text-sm text-muted-foreground">Sustainable Travel Rewards</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-4">
                <Button
                  variant={activeTab === 'track' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('track')}
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Track Trip
                </Button>
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('dashboard')}
                  className="gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Dashboard
                </Button>
              </nav>

              <div className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="md:hidden border-b bg-background">
          <div className="container mx-auto px-4 py-2">
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'track' ? 'default' : 'outline'}
                onClick={() => setActiveTab('track')}
                size="sm"
                className="flex-1 gap-2"
              >
                <MapPin className="h-4 w-4" />
                Track
              </Button>
              <Button
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                onClick={() => setActiveTab('dashboard')}
                size="sm"
                className="flex-1 gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Earn Rewards for Sustainable Travel
              </h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Walk or cycle instead of taking short trips and earn GREEN tokens on Hedera. 
                Every kilometer counts towards a greener future.
              </p>
              
              
            </div>

            <div className="mb-8">
              <HederaWalletConnect />
            </div>

            <div className="space-y-6">
              {activeTab === 'track' && (
                <div>
                  <TripTracker />
                </div>
              )}
              
              {activeTab === 'dashboard' && (
                <div>
                  <Dashboard />
                </div>
              )}
            </div>

            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <p>Connect your Hedera wallet (HashPack recommended)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <p>Choose walking or cycling and start GPS tracking</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <p>Complete your sustainable journey (min 500m, max 15km/h)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <p>Claim your GREEN tokens and track your environmental impact</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum duration:</span>
                    <span className="font-medium">5 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Maximum speed:</span>
                    <span className="font-medium">15 km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum distance:</span>
                    <span className="font-medium">500 meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Walking reward:</span>
                    <span className="font-medium">1 GREEN/km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cycling bonus:</span>
                    <span className="font-medium">+50% tokens</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">GPS Verified</h3>
                    <p className="text-sm text-muted-foreground">Real-time location tracking ensures authentic sustainable trips</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Earn GREEN Tokens</h3>
                    <p className="text-sm text-muted-foreground">1 token per km walked, 1.5x bonus for cycling</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Leaf className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Climate Impact</h3>
                    <p className="text-sm text-muted-foreground">Track your CO₂ savings and environmental contribution</p>
                  </CardContent>
                </Card>
              </div>

            <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
              <p>
                Built on Hedera • Powered by Guardian & HTS • 
                <a 
                  href="https://github.com/srijabal/GreenHop" 
                  className="text-primary hover:underline ml-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Source
                </a>
              </p>
            </footer>
          </div>
        </main>
      </div>
    </GlobalAppContextProvider>
  )
}
