import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TripData } from '../../../../packages/contracts/src';

interface TripRecord extends TripData {
  id: string;
  status: string;
  txId?: string;
  vcId?: string;
  tokensEarned: number;
  createdAt: string;
}

interface UserStats {
  totalTrips: number;
  totalDistance: number;
  totalTokensEarned: number;
  co2Saved: number;
  trips: Array<{
    id: string;
    tripType: 'walking' | 'cycling';
    distance: number;
    duration: number;
    avgSpeed: number;
    tokensEarned: number;
    status: string;
    timestamp: number;
    txId?: string;
    vcId?: string;
  }>;
}

export class SupabaseService {
  private static instance: SupabaseService;
  private supabase: SupabaseClient;

  private constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  async createTrip(tripData: TripData, status: string, tokensEarned: number, txId?: string, vcId?: string): Promise<TripRecord> {
    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const tripRecord = {
      id: tripId,
      user_account_id: tripData.userAccountId,
      start_time: new Date(tripData.startTime).toISOString(),
      end_time: new Date(tripData.endTime).toISOString(),
      distance: tripData.distance,
      avg_speed: tripData.avgSpeed,
      coordinates: tripData.coordinates,
      trip_type: tripData.tripType,
      status,
      tokens_earned: tokensEarned,
      tx_id: txId,
      vc_id: vcId,
      created_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('trips')
      .insert([tripRecord])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create trip: ${error.message}`);
    }

    return {
      ...tripData,
      id: data.id,
      status: data.status,
      txId: data.tx_id,
      vcId: data.vc_id,
      tokensEarned: data.tokens_earned,
      createdAt: data.created_at
    };
  }

  async getUserTrips(accountId: string): Promise<UserStats> {
    const { data, error } = await this.supabase
      .from('trips')
      .select('*')
      .eq('user_account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user trips: ${error.message}`);
    }

    const trips = data || [];

    return {
      totalTrips: trips.length,
      totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
      totalTokensEarned: trips.reduce((sum, trip) => sum + trip.tokens_earned, 0),
      co2Saved: Math.round(trips.reduce((sum, trip) => sum + (trip.distance / 1000 * 0.12), 0) * 1000),
      trips: trips.map(trip => ({
        id: trip.id,
        tripType: trip.trip_type,
        distance: trip.distance,
        duration: Math.round((new Date(trip.end_time).getTime() - new Date(trip.start_time).getTime()) / (1000 * 60)),
        avgSpeed: trip.avg_speed,
        tokensEarned: trip.tokens_earned,
        status: trip.status,
        timestamp: new Date(trip.end_time).getTime(),
        txId: trip.tx_id,
        vcId: trip.vc_id
      }))
    };
  }

  async getTripById(tripId: string): Promise<TripRecord | null> {
    const { data, error } = await this.supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch trip: ${error.message}`);
    }

    return {
      userAccountId: data.user_account_id,
      startTime: new Date(data.start_time).getTime(),
      endTime: new Date(data.end_time).getTime(),
      distance: data.distance,
      avgSpeed: data.avg_speed,
      coordinates: data.coordinates,
      tripType: data.trip_type,
      id: data.id,
      status: data.status,
      txId: data.tx_id,
      vcId: data.vc_id,
      tokensEarned: data.tokens_earned,
      createdAt: data.created_at
    };
  }

  async getGlobalStats() {
    const { data, error } = await this.supabase
      .from('trips')
      .select('*')
      .eq('status', 'completed');

    if (error) {
      throw new Error(`Failed to fetch global stats: ${error.message}`);
    }

    const completedTrips = data || [];

    return {
      totalTrips: completedTrips.length,
      totalDistance: completedTrips.reduce((sum, trip) => sum + trip.distance, 0),
      totalTokensIssued: completedTrips.reduce((sum, trip) => sum + trip.tokens_earned, 0),
      totalCo2Saved: Math.round(completedTrips.reduce((sum, trip) => sum + (trip.distance / 1000 * 0.12), 0) * 1000),
      avgTripDistance: completedTrips.length > 0 ? Math.round(completedTrips.reduce((sum, trip) => sum + trip.distance, 0) / completedTrips.length) : 0,
      tripTypeBreakdown: {
        walking: completedTrips.filter(t => t.trip_type === 'walking').length,
        cycling: completedTrips.filter(t => t.trip_type === 'cycling').length
      }
    };
  }

  async initializeDatabase() {
    // This would typically be handled by Supabase migrations
    // But we can create the table if it doesn't exist
    console.log('Database initialization handled by Supabase migrations');
  }
}