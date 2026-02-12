// ===============================
// STATE.JS — ESTADO GLOBAL
// ===============================
/* const STORAGE_KEY = 'gaylords-system-state';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

window.loadState = function () {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const parsed = JSON.parse(data);

  state.areas = parsed.areas || [];
  state.lotes = parsed.lotes || [];
  state.historicoExpedidos = parsed.historicoExpedidos || [];
};

window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

loadState();
*/
// ===============================
// STATE.JS — ESTADO GLOBAL
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// ===============================
// CARREGAR ESTADO
// ===============================
window.loadState = function () {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const parsed = JSON.parse(data);

  state.areas = parsed.areas || [];
  state.lotes = parsed.lotes || [];
  state.historicoExpedidos = parsed.historicoExpedidos || [];

  // 🔥 MIGRAÇÃO AUTOMÁTICA (lote → nome)
  state.historicoExpedidos = state.historicoExpedidos.map(item => {
    if (item.lote && !item.nome) {
      item.nome = item.lote;
      delete item.lote;
    }
    return item;
  });

  saveState();
};

// ===============================
// SALVAR ESTADO
// ===============================
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

loadState();
