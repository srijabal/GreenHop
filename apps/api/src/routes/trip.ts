import { FastifyPluginAsync } from 'fastify';
import { TripData } from '../../../../packages/contracts/src';
import { HederaService } from '../services/HederaService';
import { GuardianService } from '../services/GuardianService';
import { SupabaseService } from '../services/SupabaseService';

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

export const tripRoutes: FastifyPluginAsync = async (fastify) => {
  const hederaService = HederaService.getInstance();
  const guardianService = new GuardianService();
  const tokenService = hederaService.getTokenService();
  const supabaseService = SupabaseService.getInstance();

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

      // Save trip to Supabase database
      const tripRecord = await supabaseService.createTrip(
        tripData,
        tokenResult.success ? 'completed' : 'failed',
        tokenResult.tokensEarned,
        tokenResult.txId,
        guardianResult.vcId
      );

      if (tokenResult.success) {
        return reply.send({
          success: true,
          tripId: tripRecord.id,
          tokensEarned: tokenResult.tokensEarned,
          txId: tokenResult.txId,
          vcId: guardianResult.vcId,
          message: tokenResult.message
        });
      } else {
        return reply.code(400).send({
          success: false,
          tripId: tripRecord.id,
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
      
      const userStats = await supabaseService.getUserTrips(accountId);
      
      return reply.send(userStats);
    } catch (error) {
      fastify.log.error('Error fetching user trips:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get trip details by ID
  fastify.get<{ Params: { tripId: string } }>('/:tripId', async (request, reply) => {
    try {
      const { tripId } = request.params;
      
      const trip = await supabaseService.getTripById(tripId);
      
      if (!trip) {
        return reply.code(404).send({ error: 'Trip not found' });
      }

      return reply.send(trip);
    } catch (error) {
      fastify.log.error('Error fetching trip details:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get global trip statistics
  fastify.get('/stats/global', async (request, reply) => {
    try {
      const stats = await supabaseService.getGlobalStats();
      
      return reply.send(stats);
    } catch (error) {
      fastify.log.error('Error fetching global stats:', error);
      return reply.code(500).send({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};