import { ENV } from '../config/env.js';
import { remoteBackendAdapter } from './remoteBackendAdapter.js';
import { mockBackendAdapter } from './mockBackendAdapter.js';

export function getBackendAdapter() {
  return ENV.API_MODE === 'remote' ? remoteBackendAdapter : mockBackendAdapter;
}
