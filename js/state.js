// =======================================
// STATE.JS — FONTE ÚNICA DA VERDADE
// =======================================

const STORAGE_KEY = 'mapa_armazem_state';

// -------------------------------
// ESTADO PADRÃO
// -------------------------------
const defaultState = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// -------------------------------
// STATE GLOBAL
// -------------------------------
window.state = carregarState();

// -------------------------------
// CARREGAR
// -------------------------------
function carregarState() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) {
      console.warn('Nenhum estado salvo, usando padrão');
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(salvo);

    return {
      areas: parsed.areas || [],
      lotes: parsed.lotes || [],
      historicoExpedidos: parsed.historicoExpedidos || []
    };
  } catch (e) {
    console.error('Erro ao carregar state, resetando:', e);
    return structuredClone(defaultState);
  }
}

// -------------------------------
// SALVAR
// -------------------------------
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
