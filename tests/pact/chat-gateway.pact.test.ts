/**
 * Pact consumer: chat SPA ↔ unified gateway (`/api/v1` agent routes).
 * Covers GET `/ask/config` and non-stream GET `/ask` only (no SSE per spec clarifications).
 */
import { describe, it, expect } from 'vitest';
import { PactV3 } from '@pact-foundation/pact';
import { AgentServiceClient } from '../../src/app/services/agentService';
import {
  CHAT_GATEWAY_PACT_CONSUMER,
  CHAT_GATEWAY_PACT_PROVIDER,
  resolveChatPactLogLevel,
  resolveChatPactOutputDir,
} from './pactSetup';

describe('Pact: chat-frontend → vecinita-gateway', () => {
  it('honours agent config + non-stream ask interactions', async () => {
    const pact = new PactV3({
      consumer: CHAT_GATEWAY_PACT_CONSUMER,
      provider: CHAT_GATEWAY_PACT_PROVIDER,
      dir: resolveChatPactOutputDir(),
      logLevel: resolveChatPactLogLevel(),
    });

    const configBody = {
      providers: [{ name: 'groq', models: ['llama-3.1-8b'], default: true }],
      models: { groq: ['llama-3.1-8b'] },
      defaultProvider: 'groq',
      defaultModel: 'llama-3.1-8b',
    };

    const askBody = {
      answer: 'Pact contract reply',
      sources: [],
      thread_id: 'pact-thread-1',
    };

    await pact
      .addInteraction({
        uponReceiving: 'a request for gateway agent configuration',
        withRequest: {
          method: 'GET',
          path: '/api/v1/ask/config',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: configBody,
        },
      })
      .addInteraction({
        uponReceiving: 'a non-streaming ask request',
        withRequest: {
          method: 'GET',
          path: '/api/v1/ask',
          query: { question: 'hello pact' },
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: askBody,
        },
      })
      .executeTest(async (mockServer) => {
        const baseUrl = `${mockServer.url.replace(/\/$/, '')}/api/v1`;
        const client = new AgentServiceClient(baseUrl);

        const config = await client.getConfig();
        expect(config.defaultProvider).toBe('groq');

        const answer = await client.ask({ question: 'hello pact' });
        expect(answer.answer).toBe('Pact contract reply');
        expect(answer.thread_id).toBe('pact-thread-1');
      });
  });
});
