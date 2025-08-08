import { FastifyPluginAsync } from 'fastify';

interface ConnectWalletBody {
  accountId: string;
  publicKey: string;
  network: string;
}

const connectedWallets = new Map<string, { accountId: string; publicKey: string; network: string; connectedAt: number }>();

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  
  fastify.post<{ Body: ConnectWalletBody }>('/connect', async (request, reply) => {
    try {
      const { accountId, publicKey, network } = request.body;

      if (!/^0\.0\.\d+$/.test(accountId)) {
        return reply.code(400).send({ error: 'Invalid Hedera account ID format' });
      }

      connectedWallets.set(accountId, {
        accountId,
        publicKey,
        network,
        connectedAt: Date.now()
      });

      return reply.send({
        success: true,
        message: 'Wallet connected successfully',
        accountId,
        network
      });

    } catch (error) {
      fastify.log.error('Error connecting wallet:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post<{ Body: { accountId: string } }>('/disconnect', async (request, reply) => {
    try {
      const { accountId } = request.body;

      if (connectedWallets.has(accountId)) {
        connectedWallets.delete(accountId);
        return reply.send({
          success: true,
          message: 'Wallet disconnected successfully'
        });
      } else {
        return reply.code(404).send({ error: 'Wallet not found' });
      }

    } catch (error) {
      fastify.log.error('Error disconnecting wallet:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get<{ Params: { accountId: string } }>('/status/:accountId', async (request, reply) => {
    try {
      const { accountId } = request.params;
      
      const wallet = connectedWallets.get(accountId);
      
      if (wallet) {
        return reply.send({
          connected: true,
          accountId: wallet.accountId,
          network: wallet.network,
          connectedAt: wallet.connectedAt
        });
      } else {
        return reply.send({
          connected: false
        });
      }

    } catch (error) {
      fastify.log.error('Error checking wallet status:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
  
  fastify.get('/connected', async (request, reply) => {
    try {
      const wallets = Array.from(connectedWallets.values()).map(wallet => ({
        accountId: wallet.accountId,
        network: wallet.network,
        connectedAt: wallet.connectedAt
      }));

      return reply.send({
        totalConnected: wallets.length,
        wallets
      });

    } catch (error) {
      fastify.log.error('Error fetching connected wallets:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};