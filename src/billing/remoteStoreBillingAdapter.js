export const remoteStoreBillingAdapter = {
  async getProducts() {
    throw new Error('Store SDK ещё не подключён');
  },

  async purchase() {
    throw new Error('Store purchase flow ещё не подключён');
  },

  async restore() {
    throw new Error('Store restore flow ещё не подключён');
  }
};
