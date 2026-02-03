// ===============================
// MODEL + STATE GLOBAL
// ===============================

const STORAGE_KEY = 'gaylord_state_v2';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// ===============================
// LOAD / SAVE
// ===============================
window.loadState = function () {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    state.areas = data.areas || [];
    state.lotes = data.lotes || [];
    state.historicoExpedidos = data.historicoExpedidos || [];
  } catch (e) {
    console.error('Erro ao carregar state', e);
  }
};

window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// ===============================
// HELPERS
// ===============================
window.gerarCor = function () {
  return `hsl(${Math.random() * 360}, 70%, 70%)`;
};

// ===============================
// FACTORIES
// ===============================
window.criarLote = function (nome, total) {
  return {
    id: crypto.randomUUID(),
    nome,
    total,
    cor: gerarCor()
  };
};

window.criarArea = function (nome) {
  return {
    nome,
    ruas: []
  };
};

window.criarRua = function (nome, qtd) {
  return {
    nome,
    posicoes: Array.from({ length: qtd }, (_, i) => ({
      index: i,
      lote: '',
      rz: '',
      volume: ''
    }))
  };
};

// ===============================
// UTILS
// ===============================
window.buscarLote = function (nome) {
  return state.lotes.find(l => l.nome === nome);
};

window.posicaoOcupada = function (pos) {
  return pos.lote && pos.lote !== '';
};
