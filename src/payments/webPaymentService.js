import { WEB_PAYMENT_CONFIG } from '../config/webPaymentConfig.js';
import { createWebBillingSession, fetchAccessStatus } from '../api/webBillingApi.js';

export function createWebPaymentService({ sessionApi, profileApi, subscriptionApi, webPaymentApi }) {
  return {
    async createCheckout(plan = 'monthly') {
      const token = sessionApi.get().token;
      if (!token) throw new Error('Нужен вход в аккаунт');
      webPaymentApi.startCreating();

      const result = await createWebBillingSession(token, {
        plan,
        returnUrl: WEB_PAYMENT_CONFIG.successReturnUrl
      });

      webPaymentApi.setCheckout({
        checkoutUrl: result.checkoutUrl || WEB_PAYMENT_CONFIG.billingPortalUrl,
        sessionId: result.sessionId || ''
      });

      return result;
    },

    openCheckout(checkoutUrl) {
      const url = checkoutUrl || webPaymentApi.get().checkoutUrl || WEB_PAYMENT_CONFIG.billingPortalUrl;
      if (typeof window !== 'undefined' && window.open) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return url;
    },

    async refreshAccess() {
      const token = sessionApi.get().token;
      if (!token) throw new Error('Нужен вход в аккаунт');

      const status = await fetchAccessStatus(token);

      webPaymentApi.setSynced({
        access: status.access || 'free',
        expiresAt: status.expiresAt || null
      });

      if (status.subscriptionStatus === 'active') {
        subscriptionApi.activate(status.plan || 'monthly', 'external_web');
      } else if (status.subscriptionStatus === 'grace') {
        subscriptionApi.setGrace(status.plan || 'monthly');
      } else {
        subscriptionApi.deactivate();
      }

      const profile = profileApi.get();
      profileApi.setProfile({
        ...profile,
        serverSynced: true
      });

      return status;
    }
  };
}
