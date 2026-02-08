// ===============================
// STATE.JS — ESTADO GLOBAL
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// -------------------------------
// CARREGAR STATE
// -------------------------------
window.loadState = function () {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const parsed = JSON.parse(data);

  state.areas = parsed.areas || [];
  state.lotes = parsed.lotes || [];
  state.historicoExpedidos = parsed.historicoExpedidos || [];
};

// -------------------------------
// SALVAR STATE
// -------------------------------
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
