 // ===============================
// STATE.JS — FONTE ÚNICA DA VERDADE
// ===============================

const STORAGE_KEY = 'estadoArmazem';

// -------------------------------
// ESTADO PADRÃO
// -------------------------------
const estadoPadrao = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

window.state = carregarState();

// -------------------------------
// CARREGAR
// -------------------------------
function carregarState() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (!salvo) return JSON.parse(JSON.stringify(estadoPadrao));

  try {
    const data = JSON.parse(salvo);

    // Garantias de estrutura
    data.areas ??= [];
    data.lotes ??= [];
    data.historicoExpedidos ??= [];

    return data;
  } catch (e) {
    console.error('Erro ao carregar state:', e);
    return JSON.parse(JSON.stringify(estadoPadrao));
  }
}

// -------------------------------
// SALVAR
// -------------------------------
window.saveState = function () {
  recalcularSaldoLotes();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// -------------------------------
// RESET (opcional)
// -------------------------------
window.resetState = function () {
  if (!confirm('Deseja apagar todos os dados?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};
