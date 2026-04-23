import { describe, expect, it } from 'vitest';

import { resolveApiBase } from './apiBaseResolution';

describe('resolveApiBase (SC-002 gateway-only)', () => {
  it('keeps explicit gateway URL on Render-style frontend host', () => {
    const resolved = resolveApiBase('https://vecinita-gateway.onrender.com/api/v1', {
      hostname: 'vecinita-frontend.onrender.com',
      protocol: 'https:',
    });
    expect(resolved).toContain('vecinita-gateway.onrender.com');
    expect(resolved).toContain('/api/v1');
  });

  it('rewrites Render agent hostname to gateway', () => {
    const resolved = resolveApiBase('https://vecinita-agent.onrender.com/api/v1', {
      hostname: 'vecinita-frontend.onrender.com',
      protocol: 'https:',
    });
    expect(resolved).toContain('vecinita-gateway.onrender.com');
  });
});
