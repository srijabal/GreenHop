'use client'

import React, { useState, useEffect } from 'react'
import { useHederaWalletConnect } from '@/hooks/useHederaWalletConnect'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Coins, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Leaf,
  Trophy,
  RefreshCw
} from 'lucide-react'
import { formatDistance, formatDuration } from '@/lib/utils'

interface UserStats {
  totalTrips: number
  totalDistance: number
  totalTokensEarned: number
  co2Saved: number
  trips: Array<{
    id: string
    tripType: 'walking' | 'cycling'
    distance: number
    duration: number
    avgSpeed: number
    tokensEarned: number
    status: string
    timestamp: number
    txId?: string
  }>
}

interface TokenBalance {
  balance: number
  symbol: string
}

export function Dashboard() {
  const { walletState } = useHederaWalletConnect()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUserData = async () => {
    if (!walletState.accountId) return

    setLoading(true)
    try {
      const statsResponse = await fetch(`http://localhost:3001/api/trips/user/${walletState.accountId}`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats(statsData)
      }

      const balanceResponse = await fetch(`http://localhost:3001/api/tokens/balance/${walletState.accountId}`)
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json()
        setTokenBalance({
          balance: balanceData.balance,
          symbol: balanceData.symbol
        })
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletState.isConnected) {
      fetchUserData()
    }
  }, [walletState.isConnected, walletState.accountId])

  if (!walletState.isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Connect your wallet to view your dashboard
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Dashboard</h2>
          <p className="text-muted-foreground">
            Track your sustainable travel impact
          </p>
        </div>
        <Button onClick={fetchUserData} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {tokenBalance?.balance ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">GREEN Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {userStats ? formatDistance(userStats.totalDistance) : '0m'}
                </p>
                <p className="text-sm text-muted-foreground">Total Distance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {userStats?.totalTrips ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">Trips Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {userStats ? Math.round(userStats.co2Saved / 1000) : 0}kg
                </p>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {userStats && userStats.trips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userStats.trips.slice(0, 5).map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {trip.tripType === 'walking' ? '🚶‍♂️' : '🚴‍♂️'}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{trip.tripType}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistance(trip.distance)} • {formatDuration(trip.duration)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trip.status === 'completed' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                    {trip.tokensEarned > 0 && (
                      <p className="text-sm font-medium text-primary mt-1">
                        +{trip.tokensEarned} GREEN
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {userStats.trips.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    And {userStats.trips.length - 5} more trips...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {userStats && userStats.totalTrips > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl">🌍</div>
                <div>
                  <p className="text-lg font-semibold">{userStats.totalTokensEarned}</p>
                  <p className="text-sm text-muted-foreground">Tokens Earned</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl">💰</div>
                <div>
                  <p className="text-lg font-semibold">
                    ${(userStats.totalTokensEarned * 0.01).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Est. Value</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl">🌱</div>
                <div>
                  <p className="text-lg font-semibold">
                    {Math.round(userStats.co2Saved / 1000)}kg
                  </p>
                  <p className="text-sm text-muted-foreground">CO₂ Avoided</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-primary text-center">
                🎉 Great job! You've made a positive impact on the environment while earning rewards.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {userStats && userStats.trips.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No trips yet</p>
                <p className="text-sm text-muted-foreground">
                  Start your first sustainable journey to earn GREEN tokens!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}