import { ENV } from './env.js';

export const BACKEND_MAP = {
  login: `${ENV.API_BASE_URL}/auth/login`,
  register: `${ENV.API_BASE_URL}/auth/register`,
  recover: `${ENV.API_BASE_URL}/auth/recover`,
  logout: `${ENV.API_BASE_URL}/auth/logout`,
  profile: `${ENV.API_BASE_URL}/user/profile`,
  subscription: `${ENV.API_BASE_URL}/billing/subscription`,
  restore: `${ENV.API_BASE_URL}/billing/restore`
};
