'use client'

import React, { useState, useEffect } from 'react'
import { useGeolocation, GeolocationCoordinates } from '@/hooks/useGeolocation'
import { useHederaWalletConnect } from '@/hooks/useHederaWalletConnect'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  Route, 
  Gauge,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { formatDistance, formatDuration, formatSpeed, calculateDistance } from '@/lib/utils'

interface TripStats {
  distance: number
  duration: number
  avgSpeed: number
}

export function TripTracker() {
  const { walletState } = useHederaWalletConnect()
  const { 
    coordinates, 
    trackingHistory, 
    isTracking, 
    error, 
    startTracking, 
    stopTracking, 
    clearHistory 
  } = useGeolocation()

  const [tripType, setTripType] = useState<'walking' | 'cycling'>('walking')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [tripStats, setTripStats] = useState<TripStats>({ distance: 0, duration: 0, avgSpeed: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; tokensEarned?: number } | null>(null)

  useEffect(() => {
    if (trackingHistory.length > 1 && startTime) {
      const totalDistance = trackingHistory.reduce((total, coord, index) => {
        if (index === 0) return 0
        const prev = trackingHistory[index - 1]
        return total + calculateDistance(prev.lat, prev.lng, coord.lat, coord.lng)
      }, 0)

      const currentTime = Date.now()
      const duration = (currentTime - startTime) / (1000 * 60)
      const avgSpeed = duration > 0 ? (totalDistance / 1000) / (duration / 60) : 0

      setTripStats({
        distance: totalDistance,
        duration,
        avgSpeed
      })
    }
  }, [trackingHistory, startTime])

  const handleStartTrip = () => {
    setStartTime(Date.now())
    setSubmitResult(null)
    clearHistory()
    startTracking()
  }

  const handleStopTrip = () => {
    stopTracking()
  }

  const handleSubmitTrip = async () => {
    if (!walletState.isConnected || !startTime || trackingHistory.length < 2) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const tripData = {
        userAccountId: walletState.accountId!,
        startTime,
        endTime: Date.now(),
        distance: Math.round(tripStats.distance),
        avgSpeed: Number(tripStats.avgSpeed.toFixed(2)),
        coordinates: trackingHistory,
        tripType
      }

      const response = await fetch('http://localhost:3001/api/trips/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData)
      })

      const result = await response.json()

      if (result.success) {
        setSubmitResult({
          success: true,
          message: result.message,
          tokensEarned: result.tokensEarned
        })
      } else {
        setSubmitResult({
          success: false,
          message: result.message
        })
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: 'Failed to submit trip. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canStartTrip = !isTracking && walletState.isConnected
  const canStopTrip = isTracking && startTime
  const canSubmitTrip = !isTracking && startTime && trackingHistory.length >= 2 && tripStats.distance >= 500

  return (
    <div className="relative">
      {/* Blurred background overlay when tracking - only affects elements below */}
      {isTracking && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-10 pointer-events-none" />
      )}
      
      <div className="space-y-6 relative z-20">
        <Card className={isTracking ? 'bg-background/95 backdrop-blur-sm border-primary/20' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Trip Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={tripType === 'walking' ? 'default' : 'outline'}
                onClick={() => setTripType('walking')}
                disabled={isTracking}
              >
                🚶‍♂️ Walking
              </Button>
              <Button
                variant={tripType === 'cycling' ? 'default' : 'outline'}
                onClick={() => setTripType('cycling')}
                disabled={isTracking}
              >
                🚴‍♂️ Cycling
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={isTracking ? 'bg-background/95 backdrop-blur-sm border-primary/20' : ''}>
          <CardHeader>
            <CardTitle>Trip Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!walletState.isConnected && (
              <div className="p-3 bg-muted rounded-md border">
                <p className="text-sm text-muted-foreground">
                  Please connect your wallet to start tracking trips
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleStartTrip}
                disabled={!canStartTrip}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Trip
              </Button>

              <Button
                onClick={handleStopTrip}
                disabled={!canStopTrip}
                variant="outline"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Trip
              </Button>
            </div>

            {canSubmitTrip && (
              <Button
                onClick={handleSubmitTrip}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Trip & Claim Tokens'
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {(isTracking || (startTime && trackingHistory.length > 0)) && (
          <div className="relative">
            {/* Small emoji outside card, aligned with title */}
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm">
                {tripType === 'walking' ? '🚶‍♂️' : '🚴‍♂️'}
              </div>
              <h3 className="text-lg font-semibold">Current Trip</h3>
            </div>
            
            <Card className={`${isTracking ? 'bg-background/95 backdrop-blur-sm border-primary ring-2 ring-primary/30' : ''}`}>
            <CardContent className="pt-6">
              {/* Large centered GIF when tracking */}
              {isTracking ? (
                <div className="flex items-center justify-center mb-8">
                  <div className="flex flex-col items-center gap-4">
                    <img 
                      src={tripType === 'walking' ? '/walking.gif' : '/cycling.gif'} 
                      alt={`${tripType} animation`}
                      className="w-32 h-32 object-contain drop-shadow-lg"
                    />
                    <div className="text-center">
                      <p className="text-lg font-medium text-primary">
                        Tracking your {tripType} trip...
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                        <span>GPS Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 flex items-center justify-center text-3xl opacity-50">
                      <img 
                        src={tripType === 'walking' ? '/walking.gif' : '/cycling.gif'} 
                        alt={`${tripType} animation`}
                        className="w-16 h-16 object-contain opacity-50"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        Ready to track
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Simplified stats when tracking, full stats when not tracking */}
              {isTracking ? (
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {formatDistance(tripStats.distance)}
                    </p>
                    <p className="text-sm text-muted-foreground">Distance</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {formatDuration(tripStats.duration)}
                    </p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Route className="h-4 w-4" />
                        <span className="text-sm">Distance</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatDistance(tripStats.distance)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatDuration(tripStats.duration)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Gauge className="h-4 w-4" />
                        <span className="text-sm">Avg Speed</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formatSpeed(tripStats.avgSpeed)}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">Points</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {trackingHistory.length}
                      </p>
                    </div>
                  </div>

                  {coordinates && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Current Position:</p>
                      <p className="font-mono text-sm">
                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </p>
                      {coordinates.accuracy && (
                        <p className="text-xs text-muted-foreground">
                          Accuracy: ±{Math.round(coordinates.accuracy)}m
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
            </Card>
          </div>
        )}

        {submitResult && (
          <Card>
            <CardContent className="pt-6">
              {submitResult.success ? (
                <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-md border border-primary/20">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Trip Submitted Successfully!</p>
                    <p className="text-sm text-muted-foreground">
                      {submitResult.message}
                    </p>
                    {submitResult.tokensEarned && (
                      <p className="text-sm font-medium mt-1">
                        🪙 Earned {submitResult.tokensEarned} GREEN tokens
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Trip Submission Failed</p>
                    <p className="text-sm text-muted-foreground">
                      {submitResult.message}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}