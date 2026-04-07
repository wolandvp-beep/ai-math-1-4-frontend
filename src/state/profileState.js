import { profileStorage } from '../storage/profileStorage.js';

export function createProfileState() {
  const persisted = profileStorage.read();
  const state = {
    name: persisted.name || '',
    email: persisted.email || '',
    childName: persisted.childName || '',
    serverSynced: Boolean(persisted.serverSynced)
  };

  function persist() {
    profileStorage.write(state);
  }

  return {
    get() { return state; },
    setProfile(next) {
      state.name = next.name || '';
      state.email = next.email || '';
      state.childName = next.childName || '';
      state.serverSynced = Boolean(next.serverSynced);
      persist();
    },
    clear() {
      state.name = '';
      state.email = '';
      state.childName = '';
      state.serverSynced = false;
      profileStorage.clear();
    }
  };
}
