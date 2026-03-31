import { ENV } from '../config/env.js';
import { mockStoreBillingAdapter } from './mockStoreBillingAdapter.js';
import { remoteStoreBillingAdapter } from './remoteStoreBillingAdapter.js';

export function getStoreBillingAdapter() {
  return ENV.API_MODE === 'remote' ? remoteStoreBillingAdapter : mockStoreBillingAdapter;
}
