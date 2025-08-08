import { FastifyPluginAsync } from 'fastify';
import { HederaService } from '../services/HederaService';

export const tokenRoutes: FastifyPluginAsync = async (fastify) => {
  const hederaService = HederaService.getInstance();

  // TODO: Get token information from the token service
  fastify.get('/info', async (request, reply) => {
    try {
      const tokenService = hederaService.getTokenService();
      
      return reply.send({
        tokenId: tokenService.getTokenId(),
        name: 'GreenHop Sustainability Token',
        symbol: 'GREEN',
        decimals: 0,
        description: 'Rewards for sustainable last-mile travel',
        network: process.env.HEDERA_NETWORK || 'testnet'
      });

    } catch (error) {
      fastify.log.error('Error fetching token info:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get<{ Params: { accountId: string } }>('/balance/:accountId', async (request, reply) => {
    try {
      const { accountId } = request.params;

      if (!/^0\.0\.\d+$/.test(accountId)) {
        return reply.code(400).send({ error: 'Invalid Hedera account ID format' });
      }

      const mockBalance = Math.floor(Math.random() * 100);

      return reply.send({
        accountId,
        tokenId: hederaService.getTokenService().getTokenId(),
        balance: mockBalance,
        symbol: 'GREEN'
      });

    } catch (error) {
      fastify.log.error('Error fetching token balance:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.get<{ Params: { accountId: string } }>('/transactions/:accountId', async (request, reply) => {
    try {
      const { accountId } = request.params;

      const mockTransactions = [
        {
          transactionId: '0.0.123-1234567890-123456789',
          timestamp: Date.now() - 3600000, // 1 hour ago
          type: 'TOKEN_TRANSFER',
          amount: 5,
          from: process.env.HEDERA_ACCOUNT_ID,
          to: accountId,
          memo: 'Trip reward: walking'
        },
        {
          transactionId: '0.0.123-1234567890-123456788',
          timestamp: Date.now() - 7200000, // 2 hours ago
          type: 'TOKEN_TRANSFER',
          amount: 3,
          from: process.env.HEDERA_ACCOUNT_ID,
          to: accountId,
          memo: 'Trip reward: cycling'
        }
      ];

      return reply.send({
        accountId,
        tokenId: hederaService.getTokenService().getTokenId(),
        transactions: mockTransactions
      });

    } catch (error) {
      fastify.log.error('Error fetching token transactions:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  fastify.post<{ Body: { amount: number; memo?: string } }>('/mint', async (request, reply) => {
    try {
      const { amount, memo } = request.body;

      if (!amount || amount <= 0) {
        return reply.code(400).send({ error: 'Invalid amount' });
      }

      const tokenService = hederaService.getTokenService();
      const txId = await tokenService.mintTokens(amount, memo);

      return reply.send({
        success: true,
        amount,
        transactionId: txId,
        message: `Successfully minted ${amount} GREEN tokens`
      });

    } catch (error) {
      fastify.log.error('Error minting tokens:', error);
      return reply.code(500).send({ 
        error: 'Minting failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  fastify.post<{ Body: { toAccountId: string; amount: number } }>('/transfer', async (request, reply) => {
    try {
      const { toAccountId, amount } = request.body;

      if (!toAccountId || !amount || amount <= 0) {
        return reply.code(400).send({ error: 'Invalid parameters' });
      }

      if (!/^0\.0\.\d+$/.test(toAccountId)) {
        return reply.code(400).send({ error: 'Invalid Hedera account ID format' });
      }

      const tokenService = hederaService.getTokenService();
      const txId = await tokenService.transferTokens(toAccountId, amount);

      return reply.send({
        success: true,
        toAccountId,
        amount,
        transactionId: txId,
        message: `Successfully transferred ${amount} GREEN tokens to ${toAccountId}`
      });

    } catch (error) {
      fastify.log.error('Error transferring tokens:', error);
      return reply.code(500).send({ 
        error: 'Transfer failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
};