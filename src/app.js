import { createI18n } from './i18n/index.js';
import { createAppState } from './state/appState.js';
import { createRouter } from './state/router.js';
import { createUserSessionState } from './state/userSession.js';
import { createSubscriptionState } from './state/subscriptionState.js';
import { createProfileState } from './state/profileState.js';
import { createPurchaseFlowState } from './state/purchaseFlowState.js';
import { createWebPaymentState } from './state/webPaymentState.js';
import { createFormState } from './state/formState.js';
import { validateEmail, validatePassword, validateName } from './utils/validation.js';
import { renderUserProfileScreen } from './screens/userProfileScreen.js';
import { renderProfileEditorScreen } from './screens/profileEditorScreen.js';
import { createSessionService } from './services/sessionService.js';
import { createBillingService } from './services/billingService.js';
import { getBackendAdapter } from './adapters/backendAdapter.js';
import { getStoreBillingAdapter } from './billing/storeBillingAdapter.js';
import { createStoreBillingService } from './billing/storeBillingService.js';
import { renderStoreBillingScreen } from './screens/storeBillingScreen.js';
import { createWebPaymentService } from './payments/webPaymentService.js';
import { renderExternalPaymentScreen } from './screens/externalPaymentScreen.js';
import { createToastHost } from './components/toast.js';
import { renderBottomNav } from './components/bottomNav.js';
import { renderHomeScreen } from './screens/homeScreen.js';
import { renderSolveScreen } from './screens/solveScreen.js';
import { renderHistoryScreen } from './screens/historyScreen.js';
import { renderProfileScreen } from './screens/profileScreen.js';
import { renderSecondaryScreens } from './screens/secondaryScreens.js';
import { renderAccountScreens } from './screens/accountScreen.js';
import { renderSubscriptionScreens } from './screens/subscriptionScreen.js';
import { explainTask } from './api/explanationsApi.js';
import { normalizeAssistantText } from './utils/text.js';
import { speakText, pauseSpeech, stopSpeech } from './utils/speech.js';

export function createApp(root) {
  const i18n = createI18n();
  const router = createRouter('home');
  const stateApi = createAppState(router.getRoute());
  const sessionApi = createUserSessionState();
  const subscriptionApi = createSubscriptionState();
  const profileApi = createProfileState();
  const purchaseFlowApi = createPurchaseFlowState();
  const webPaymentApi = createWebPaymentState();
  const toast = createToastHost();
  const backend = getBackendAdapter();
  const storeBillingAdapter = getStoreBillingAdapter();
  const sessionService = createSessionService({ sessionApi, profileApi, subscriptionApi, backend });
  const billingService = createBillingService({ sessionApi, subscriptionApi, backend });
  const storeBillingService = createStoreBillingService({ billingAdapter: storeBillingAdapter, billingService, purchaseFlowApi });
  const webPaymentService = createWebPaymentService({ sessionApi, profileApi, subscriptionApi, webPaymentApi });
  const loginForm = createFormState({ email: '', password: '' });
  const registerForm = createFormState({ name: '', email: '', password: '' });
  const recoveryForm = createFormState({ email: '' });

  const applySavedLanguage = () => {
    const state = stateApi.get();
    if (state.settings?.language) i18n.setLanguage(state.settings.language);
  };


  function collectLoginValues() {
    return {
      email: document.getElementById('loginEmail')?.value || '',
      password: document.getElementById('loginPassword')?.value || ''
    };
  }

  function collectRegisterValues() {
    return {
      name: document.getElementById('registerName')?.value || '',
      email: document.getElementById('registerEmail')?.value || '',
      password: document.getElementById('registerPassword')?.value || ''
    };
  }

  function collectRecoveryValues() {
    return {
      email: document.getElementById('recoveryEmail')?.value || ''
    };
  }


  function collectProfileEditorValues() {
    return {
      name: document.getElementById('profileName')?.value || '',
      childName: document.getElementById('profileChildName')?.value || ''
    };
  }

  function renderFormErrors(containerId, errors) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = errors.length ? errors.join('<br>') : '';
  }



  async function syncServerState() {
    const session = sessionApi.get();
    const token = session.token;

    if (!token) {
      toast('Пока нет токена для серверной синхронизации');
      return;
    }

    try {
      await Promise.all([
        sessionService.syncProfile().catch(() => null),
        billingService.syncSubscription().catch(() => null)
      ]);
      view();
      toast('Серверная синхронизация завершена');
    } catch (error) {
      toast('Синхронизация недоступна: ' + error.message);
    }
  }



  async function ensureStoreProductsLoaded() {
    if (Array.isArray(root.__storeProducts) && root.__storeProducts.length) return;
    try {
      root.__storeProducts = await storeBillingService.loadProducts();
    } catch (error) {
      root.__storeProducts = [];
    }
  }


  function view() {
    const state = stateApi.get();
    state.route = router.getRoute();
    const session = sessionApi.get();
    const subscription = subscriptionApi.get();
    const profile = profileApi.get();
    const purchaseFlow = purchaseFlowApi.get();
    const webPayment = webPaymentApi.get();
    const t = i18n.t.bind(i18n);
    const products = root.__storeProducts || [];

    root.innerHTML = `
      <div class="app-shell">
        ${renderHomeScreen({ t, state })}
        ${renderSolveScreen({ t, state })}
        ${renderHistoryScreen({ t, state })}
        ${renderProfileScreen({ t, state, session, subscription })}
        ${renderSecondaryScreens({ t, state })}
        ${renderAccountScreens({ state, session })}
        ${renderSubscriptionScreens({ state, subscription })}
        ${renderExternalPaymentScreen({ state, webPayment, subscription })}
        ${renderStoreBillingScreen({ state, purchaseFlow, products })}
        ${renderUserProfileScreen({ state, profile })}
        ${renderProfileEditorScreen({ state, profile })}
      </div>
      ${renderBottomNav({ t, route: state.route })}
    `;

    bindEvents();
  }

  function openHistoryItem(id) {
    const state = stateApi.get();
    const item = state.history.find(x => x.id === id);
    if (!item) return;
    stateApi.setDraft(item.task);
    stateApi.setResult(item.result);
    router.go('solve');
    stateApi.setRoute('solve');
    view();
    toast('Открыто');
  }

  async function handleSolve() {
    const input = document.getElementById('taskInput');
    const text = String(input?.value || '').trim();
    if (!text) {
      toast('Введите текст задачи');
      return;
    }

    const resultBox = document.getElementById('resultBox');
    if (resultBox) resultBox.textContent = '🤖 Думаю...';
    stateApi.setDraft(text);

    try {
      const raw = await explainTask(text);
      const result = normalizeAssistantText(raw);
      stateApi.setResult(result);
      stateApi.pushHistory({
        id: Date.now(),
        task: text,
        result,
        createdAt: new Date().toISOString()
      });
      view();
    } catch (error) {
      stateApi.setResult('Ошибка: ' + error.message);
      view();
    }
  }

  function bindEvents() {
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const route = btn.dataset.nav;
        if (router.go(route)) {
          stateApi.setRoute(route);
          view();
        }
      });
    });

    document.querySelectorAll('[data-open-stub]').forEach(btn => {
      btn.addEventListener('click', async () => {
        toast(i18n.t('toast.stub'));
      });
    });

    document.querySelectorAll('[data-stub-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.stubAction;

        if (action === 'login-submit') {
          const values = collectLoginValues();
          loginForm.setValue('email', values.email);
          loginForm.setValue('password', values.password);

          const errors = [
            validateEmail(values.email),
            validatePassword(values.password)
          ].filter(Boolean);

          renderFormErrors('loginErrors', errors);
          if (errors.length) return;

          try {
            await sessionService.login(values);
            await syncServerState();
            router.go('profile');
            stateApi.setRoute('profile');
            view();
            toast('Вход выполнен');
          } catch (error) {
            sessionApi.setAuthenticated({ name: 'Пользователь', email: values.email || 'demo@example.com' }, 'demo-token');
            profileApi.setProfile({
              name: 'Пользователь',
              email: values.email || 'demo@example.com',
              childName: '',
              serverSynced: false
            });
            router.go('profile');
            stateApi.setRoute('profile');
            view();
            toast('Демо-вход выполнен');
          }
          return;
        }

        if (action === 'register-submit') {
          const values = collectRegisterValues();
          registerForm.setValue('name', values.name);
          registerForm.setValue('email', values.email);
          registerForm.setValue('password', values.password);

          const errors = [
            validateName(values.name),
            validateEmail(values.email),
            validatePassword(values.password)
          ].filter(Boolean);

          renderFormErrors('registerErrors', errors);
          if (errors.length) return;

          try {
            await sessionService.register(values);
            router.go('profile');
            stateApi.setRoute('profile');
            view();
            toast('Регистрация выполнена');
          } catch (error) {
            sessionApi.setAuthenticated({ name: values.name, email: values.email }, 'demo-token');
            sessionApi.markAction('register');
            profileApi.setProfile({
              name: values.name,
              email: values.email,
              childName: '',
              serverSynced: false
            });
            router.go('profile');
            stateApi.setRoute('profile');
            view();
            toast('Демо-регистрация завершена');
          }
          return;
        }

        if (action === 'recovery-submit') {
          const values = collectRecoveryValues();
          recoveryForm.setValue('email', values.email);

          const errors = [
            validateEmail(values.email)
          ].filter(Boolean);

          renderFormErrors('recoveryErrors', errors);
          if (errors.length) return;

          try {
            await sessionService.recover(values);
            sessionApi.markAction('recovery');
            toast('Ссылка отправлена');
          } catch (error) {
            sessionApi.markAction('recovery');
            toast('Демо-ссылка отправлена');
          }
          return;
        }

        if (action === 'plans-submit') {
          subscriptionApi.activate('monthly', 'demo');
          router.go('subscription');
          stateApi.setRoute('subscription');
          view();
          toast('Демо-подписка активирована');
          return;
        }



        if (action === 'create-web-checkout') {
          try {
            const plan = webPaymentApi.get().selectedPlan || 'monthly';
            await webPaymentService.createCheckout(plan);
            view();
            toast('Платёжная ссылка создана');
          } catch (error) {
            webPaymentApi.fail(error.message || 'Не удалось создать ссылку');
            view();
            toast(error.message || 'Не удалось создать ссылку');
          }
          return;
        }

        if (action === 'open-web-checkout') {
          try {
            const url = webPaymentService.openCheckout();
            toast(url ? 'Ссылка открыта' : 'Нет ссылки для открытия');
          } catch (error) {
            toast(error.message || 'Не удалось открыть ссылку');
          }
          return;
        }

        if (action === 'refresh-web-access') {
          try {
            await webPaymentService.refreshAccess();
            view();
            toast('Доступ обновлён');
          } catch (error) {
            webPaymentApi.fail(error.message || 'Не удалось обновить доступ');
            view();
            toast(error.message || 'Не удалось обновить доступ');
          }
          return;
        }

        if (action === 'start-store-purchase') {
          const selectedPlan = purchaseFlowApi.get().selectedPlan || 'monthly';
          try {
            await storeBillingService.purchase(selectedPlan);
            subscriptionApi.activate(selectedPlan, 'store');
            router.go('subscription');
            stateApi.setRoute('subscription');
            view();
            toast('Покупка выполнена');
          } catch (error) {
            view();
            toast(error.message || 'Покупка не выполнена');
          }
          return;
        }

        if (action === 'restore-store-purchase') {
          try {
            await storeBillingService.restore();
            router.go('subscription');
            stateApi.setRoute('subscription');
            view();
            toast('Покупка восстановлена');
          } catch (error) {
            view();
            toast(error.message || 'Восстановление не выполнено');
          }
          return;
        }

        if (action === 'restore-purchase') {
          try {
            await billingService.restoreFromStore();
            await billingService.syncSubscription().catch(() => null);
            router.go('subscription');
            stateApi.setRoute('subscription');
            view();
            toast('Покупка восстановлена');
          } catch (error) {
            subscriptionApi.setGrace('monthly');
            router.go('subscription');
            stateApi.setRoute('subscription');
            view();
            toast('Демо-восстановление выполнено');
          }
          return;
        }



        if (action === 'save-profile') {
          const values = collectProfileEditorValues();
          const errors = [];
          if (!String(values.name || '').trim()) errors.push('Введите имя.');
          renderFormErrors('profileEditorErrors', errors);
          if (errors.length) return;

          const session = sessionApi.get();
          try {
            if (session.token) {
              await sessionService.saveProfile({
                name: values.name,
                childName: values.childName,
                language: 'ru'
              });
              router.go('userProfile');
              stateApi.setRoute('userProfile');
              view();
              toast('Профиль сохранён');
              return;
            }
          } catch (error) {
          }

          profileApi.setProfile({
            name: values.name,
            email: profileApi.get().email || session.user?.email || '',
            childName: values.childName,
            serverSynced: false
          });
          router.go('userProfile');
          stateApi.setRoute('userProfile');
          view();
          toast('Локальный профиль сохранён');
          return;
        }

        if (action === 'sync-profile') {
          await syncServerState();
          return;
        }

        if (action === 'logout-submit') {
          try {
            await sessionService.logout();
          } catch (error) {
            sessionApi.setGuest();
            profileApi.clear();
          }
          router.go('profile');
          stateApi.setRoute('profile');
          view();
          toast('Выход выполнен');
          return;
        }

        if (action === 'deactivate-subscription') {
          subscriptionApi.deactivate();
          router.go('subscription');
          stateApi.setRoute('subscription');
          view();
          toast('Подписка отключена');
          return;
        }

        toast(i18n.t('toast.stub'));
      });
    });

    document.querySelectorAll('[data-history-open]').forEach(btn => {
      btn.addEventListener('click', () => openHistoryItem(Number(btn.dataset.historyOpen)));
    });

    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
      const example = taskInput.dataset.example || '';
      taskInput.addEventListener('focus', () => {
        if (taskInput.value === example) {
          taskInput.value = '';
          taskInput.classList.remove('example-text');
        }
      });
      taskInput.addEventListener('blur', () => {
        if (!taskInput.value.trim()) {
          taskInput.value = example;
          taskInput.classList.add('example-text');
          stateApi.setDraft('');
        }
      });
      taskInput.addEventListener('input', (e) => {
        const value = e.target.value === example ? '' : e.target.value;
        stateApi.setDraft(value);
      });
    }

    const solveBtn = document.getElementById('solveBtn');
    if (solveBtn) solveBtn.addEventListener('click', handleSolve);

    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const text = stateApi.get().currentResult || '';
        if (!text.trim()) return toast('Пока нет текста');
        await navigator.clipboard.writeText(text);
        toast('Скопировано');
      });
    }

    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        const ok = speakText(stateApi.get().currentResult);
        if (!ok) toast('Нет текста для озвучки');
      });
    }

    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        const ok = pauseSpeech();
        if (!ok) toast('Озвучка не запущена');
      });
    }

    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        const ok = stopSpeech();
        if (!ok) toast('Озвучка не запущена');
      });
    }

    const pauseVoiceBtn = document.getElementById('pauseVoiceBtn');
    if (pauseVoiceBtn) {
      pauseVoiceBtn.addEventListener('click', () => {
        const ok = pauseSpeech();
        if (!ok) toast('Нечего ставить на паузу');
      });
    }

    const stopVoiceBtn = document.getElementById('stopVoiceBtn');
    if (stopVoiceBtn) {
      stopVoiceBtn.addEventListener('click', () => {
        const ok = stopSpeech();
        if (!ok) toast('Озвучка недоступна');
      });
    }

    const historySearch = document.getElementById('historySearch');
    if (historySearch) {
      historySearch.addEventListener('input', e => {
        stateApi.setHistoryQuery(e.target.value);
        view();
      });
    }

    const historyAllBtn = document.getElementById('historyAllBtn');
    if (historyAllBtn) historyAllBtn.addEventListener('click', () => { stateApi.setHistoryMode('all'); view(); });

    const historyFavBtn = document.getElementById('historyFavBtn');
    if (historyFavBtn) historyFavBtn.addEventListener('click', () => { stateApi.setHistoryMode('favorites'); view(); });
  }

  applySavedLanguage();
  ensureStoreProductsLoaded().finally(() => view());
}
