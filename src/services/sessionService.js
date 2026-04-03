export function createSessionService({ sessionApi, profileApi, subscriptionApi, backend }) {
  return {
    async login(values) {
      const response = await backend.login(values);
      sessionApi.setAuthenticated(
        { name: response.user?.name || 'Пользователь', email: response.user?.email || values.email },
        response.token || ''
      );
      profileApi.setProfile({
        name: response.user?.name || 'Пользователь',
        email: response.user?.email || values.email,
        childName: response.user?.childName || '',
        serverSynced: true
      });
      return response;
    },

    async register(values) {
      const response = await backend.register(values);
      sessionApi.setAuthenticated(
        { name: response.user?.name || values.name, email: response.user?.email || values.email },
        response.token || ''
      );
      sessionApi.markAction('register');
      profileApi.setProfile({
        name: response.user?.name || values.name,
        email: response.user?.email || values.email,
        childName: response.user?.childName || '',
        serverSynced: true
      });
      return response;
    },

    async recover(values) {
      return backend.recover(values);
    },

    async syncProfile() {
      const token = sessionApi.get().token;
      if (!token) throw new Error('Нет токена');
      const profileResponse = await backend.getProfile(token);
      profileApi.setProfile({
        name: profileResponse.name || '',
        email: profileResponse.email || '',
        childName: profileResponse.childName || '',
        serverSynced: true
      });
      return profileResponse;
    },

    async saveProfile(values) {
      const token = sessionApi.get().token;
      if (!token) throw new Error('Нет токена');
      const response = await backend.updateProfile(token, values);
      profileApi.setProfile({
        name: response.profile?.name || values.name || '',
        email: profileApi.get().email || sessionApi.get().user?.email || '',
        childName: response.profile?.childName || values.childName || '',
        serverSynced: true
      });
      return response;
    },

    async logout() {
      try {
        await backend.logout(sessionApi.get().token || '');
      } catch {
      }
      sessionApi.setGuest();
      profileApi.clear();
      subscriptionApi.deactivate();
      return { ok: true };
    }
  };
}
