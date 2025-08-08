-- Supabase SQL Schema for GreenHop
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.trips (
    id VARCHAR PRIMARY KEY,
    user_account_id VARCHAR NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    distance INTEGER NOT NULL, -- in meters
    avg_speed DECIMAL(5,2) NOT NULL, -- km/h
    coordinates JSONB NOT NULL, -- GPS coordinates array
    trip_type VARCHAR(10) NOT NULL CHECK (trip_type IN ('walking', 'cycling')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    tokens_earned INTEGER DEFAULT 0,
    tx_id VARCHAR, -- Hedera transaction ID
    vc_id VARCHAR, -- Guardian Verifiable Credential ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trips_user_account_id ON public.trips(user_account_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trips_trip_type ON public.trips(trip_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own trips
CREATE POLICY "Users can view their own trips" ON public.trips
    FOR SELECT USING (true); -- Allow all reads for now, you can restrict later

-- Create policy to allow trip creation
CREATE POLICY "Allow trip creation" ON public.trips
    FOR INSERT WITH CHECK (true); -- Allow all inserts for now

-- Create policy to allow trip updates
CREATE POLICY "Allow trip updates" ON public.trips
    FOR UPDATE USING (true); -- Allow all updates for now