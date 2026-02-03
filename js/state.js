// ===============================
// STATE.JS — CONTROLE DE ESTADO
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

// Estado global
window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// ===============================
// LOAD STATE
// ===============================
function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);

    // Garantias (evita state quebrado)
    state.areas = parsed.areas || [];
    state.lotes = parsed.lotes || [];
    state.historicoExpedidos = parsed.historicoExpedidos || [];

  } catch (err) {
    console.error('Erro ao carregar state:', err);
    alert('Erro ao carregar dados salvos. O sistema será reiniciado.');
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ===============================
// SAVE STATE
// ===============================
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Erro ao salvar state:', err);
    alert('Erro ao salvar dados.');
  }
}

// ===============================
// RESET (DEBUG)
// ===============================
function resetState() {
  if (!confirm('Deseja apagar TODOS os dados?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ===============================
// INIT AUTOMÁTICO
// ===============================
loadState();
