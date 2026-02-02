// ==================================
// STATE.JS — ESTADO GLOBAL
// ==================================

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

const STORAGE_KEY = 'gaylords-state';

// ===============================
// LOAD
// ===============================
window.loadState = function () {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);

    // garante estrutura
    state.areas = Array.isArray(data.areas) ? data.areas : [];
    state.lotes = Array.isArray(data.lotes) ? data.lotes : [];
    state.historicoExpedidos = Array.isArray(data.historicoExpedidos)
      ? data.historicoExpedidos
      : [];
  } catch (e) {
    console.error('Erro ao carregar state:', e);
  }
};

// ===============================
// SAVE
// ===============================
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
