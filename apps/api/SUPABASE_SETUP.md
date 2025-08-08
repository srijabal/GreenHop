# Supabase Setup Guide for GreenHop

## 1. Create a Supabase Project
1. Go to https://supabase.com
2. Sign up/Login and create a new project
3. Wait for the project to be ready

## 2. Set up the Database
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Copy and paste the contents of `supabase_schema.sql` 
4. Click "Run" to create the trips table and indexes

## 3. Get Your Credentials
1. Go to "Settings" > "API" in your Supabase dashboard
2. Copy your:
   - Project URL (`SUPABASE_URL`)
   - Anon public key (`SUPABASE_ANON_KEY`)

## 4. Configure Environment
1. Copy `.env.example` to `.env`
2. Replace the placeholder values:
   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 5. Test the Setup
Run your API server:
```bash
npm run dev
```

Test with a sample trip:
```bash
curl -X POST http://localhost:3001/api/trips/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userAccountId":"0.0.123456",
    "startTime":1640995200000,
    "endTime":1640998800000,
    "distance":1000,
    "avgSpeed":5,
    "coordinates":[{"lat":40.7128,"lng":-74.0060,"timestamp":1640995200000}],
    "tripType":"walking"
  }'
```

## 6. Verify Data
Check your Supabase dashboard under "Table Editor" > "trips" to see the data.