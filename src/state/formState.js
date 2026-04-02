export function createFormState(initial = {}) {
  const state = {
    values: { ...initial },
    errors: {}
  };

  return {
    get() { return state; },
    setValue(name, value) {
      state.values[name] = value;
    },
    setError(name, error) {
      if (error) state.errors[name] = error;
      else delete state.errors[name];
    },
    setErrors(nextErrors) {
      state.errors = { ...nextErrors };
    },
    clearErrors() {
      state.errors = {};
    }
  };
}
