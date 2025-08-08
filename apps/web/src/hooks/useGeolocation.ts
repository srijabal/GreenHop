'use client'

import { useState, useEffect, useCallback } from 'react'

export interface GeolocationCoordinates {
  lat: number
  lng: number
  timestamp: number
  accuracy?: number
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null
  error: string | null
  isTracking: boolean
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown'
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isTracking: false,
    permissionStatus: 'unknown'
  })

  const [watchId, setWatchId] = useState<number | null>(null)
  const [trackingHistory, setTrackingHistory] = useState<GeolocationCoordinates[]>([])

  const checkPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        setState(prev => ({ ...prev, permissionStatus: result.state }))
      } catch (error) {
        setState(prev => ({ ...prev, permissionStatus: 'unknown' }))
      }
    }
  }, [])

  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev, 
        error: 'Geolocation is not supported by this browser',
        isTracking: false 
      }))
      return
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const coordinates: GeolocationCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now(),
        accuracy: position.coords.accuracy
      }

      setState(prev => ({
        ...prev,
        coordinates,
        error: null,
        isTracking: true
      }))

      setTrackingHistory(prev => [...prev, coordinates])
    }

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown geolocation error'
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timeout'
          break
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isTracking: false
      }))
    }

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    )

    setWatchId(id)
    setState(prev => ({ ...prev, isTracking: true, error: null }))
  }, [])

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setState(prev => ({ ...prev, isTracking: false }))
  }, [watchId])

  const clearHistory = useCallback(() => {
    setTrackingHistory([])
    setState(prev => ({ ...prev, coordinates: null, error: null }))
  }, [])

  const getCurrentPosition = useCallback(() => {
    return new Promise<GeolocationCoordinates>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: GeolocationCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy
          }
          resolve(coordinates)
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }, [])

  return {
    ...state,
    trackingHistory,
    startTracking,
    stopTracking,
    clearHistory,
    getCurrentPosition
  }
}