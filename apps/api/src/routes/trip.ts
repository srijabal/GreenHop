import { FastifyPluginAsync } from 'fastify';
import { TripData } from '../../../../packages/contracts/src';
import { HederaService } from '../services/HederaService';
import { GuardianService } from '../services/GuardianService';

interface TripSubmissionBody {
  userAccountId: string;
  startTime: number;
  endTime: number;
  distance: number;
  avgSpeed: number;
  coordinates: Array<{
    lat: number;
    lng: number;
    timestamp: number;
  }>;
  tripType: 'walking' | 'cycling';
}

const tripHistory: Array<TripData & { id: string; status: string; txId?: string; vcId?: string; tokensEarned: number }> = [];

export const tripRoutes: FastifyPluginAsync = async (fastify) => {
  const hederaService = HederaService.getInstance();
  const guardianService = new GuardianService();
  const tokenService = hederaService.getTokenService();

  fastify.post<{ Body: TripSubmissionBody }>('/submit', async (request, reply) => {
    try {
      const tripData: TripData = request.body;
      
      const requiredFields = ['userAccountId', 'startTime', 'endTime', 'distance', 'avgSpeed', 'coordinates', 'tripType'];
      for (const field of requiredFields) {
        if (!(field in tripData)) {
          return reply.code(400).send({ error: `Missing required field: ${field}` });
        }
      }

      const tripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const guardianResult = await guardianService.submitTripForVerification(tripData);
      
      if (!guardianResult.success) {
        return reply.code(400).send({ 
          error: 'Trip verification failed', 
          message: guardianResult.message 
        });
      }

      const tokenResult = await tokenService.processTrip(tripData);

      const tripRecord = {
        ...tripData,
        id: tripId,
        status: tokenResult.success ? 'completed' : 'failed',
        txId: tokenResult.txId,
        vcId: guardianResult.vcId,
        tokensEarned: tokenResult.tokensEarned
      };

      tripHistory.push(tripRecord);

      if (tokenResult.success) {
        return reply.send({
          success: true,
          tripId,
          tokensEarned: tokenResult.tokensEarned,
          txId: tokenResult.txId,
          vcId: guardianResult.vcId,
          message: tokenResult.message
        });
      } else {
        return reply.code(400).send({
          success: false,
          tripId,
          message: tokenResult.message
        });
      }

    } catch (error) {
      fastify.log.error('Error processing trip submission:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.get<{ Params: { accountId: string } }>('/user/:accountId', async (request, reply) => {
    try {
      const { accountId } = request.params;
      
      const userTrips = tripHistory.filter(trip => trip.userAccountId === accountId);
      
      const summary = {
        totalTrips: userTrips.length,
        totalDistance: userTrips.reduce((sum, trip) => sum + trip.distance, 0),
        totalTokensEarned: userTrips.reduce((sum, trip) => sum + trip.tokensEarned, 0),
        co2Saved: Math.round(userTrips.reduce((sum, trip) => sum + (trip.distance / 1000 * 0.12), 0) * 1000),
        trips: userTrips.map(trip => ({
          id: trip.id,
          tripType: trip.tripType,
          distance: trip.distance,
          duration: Math.round((trip.endTime - trip.startTime) / (1000 * 60)), // minutes
          avgSpeed: trip.avgSpeed,
          tokensEarned: trip.tokensEarned,
          status: trip.status,
          timestamp: trip.endTime,
          txId: trip.txId,
          vcId: trip.vcId
        }))
      };

      return reply.send(summary);
    } catch (error) {
      fastify.log.error('Error fetching user trips:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get trip details by ID
  fastify.get<{ Params: { tripId: string } }>('/:tripId', async (request, reply) => {
    try {
      const { tripId } = request.params;
      
      const trip = tripHistory.find(t => t.id === tripId);
      
      if (!trip) {
        return reply.code(404).send({ error: 'Trip not found' });
      }

      return reply.send(trip);
    } catch (error) {
      fastify.log.error('Error fetching trip details:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get global trip statistics
  fastify.get('/stats/global', async (request, reply) => {
    try {
      const completedTrips = tripHistory.filter(trip => trip.status === 'completed');
      
      const stats = {
        totalTrips: completedTrips.length,
        totalDistance: completedTrips.reduce((sum, trip) => sum + trip.distance, 0),
        totalTokensIssued: completedTrips.reduce((sum, trip) => sum + trip.tokensEarned, 0),
        totalCo2Saved: Math.round(completedTrips.reduce((sum, trip) => sum + (trip.distance / 1000 * 0.12), 0) * 1000), // grams
        avgTripDistance: completedTrips.length > 0 ? Math.round(completedTrips.reduce((sum, trip) => sum + trip.distance, 0) / completedTrips.length) : 0,
        tripTypeBreakdown: {
          walking: completedTrips.filter(t => t.tripType === 'walking').length,
          cycling: completedTrips.filter(t => t.tripType === 'cycling').length
        }
      };

      return reply.send(stats);
    } catch (error) {
      fastify.log.error('Error fetching global stats:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};