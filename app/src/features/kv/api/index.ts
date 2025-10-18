import { CalimeroApp } from '@calimero-network/calimero-client';
import { AbiClient } from '../../../api/AbiClient';

export async function createKvClient(app: CalimeroApp): Promise<AbiClient> {
  const contexts = await app.fetchContexts();
  if (contexts.length === 0) {
    throw new Error('No context available');
  }
  return new AbiClient(app, contexts[0]);
}

export { AbiClient };
