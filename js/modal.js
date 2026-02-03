// =======================================
// MODEL.JS
// Define a estrutura oficial dos dados
// =======================================

// ---------- POSIÇÃO (Gaylord) ----------
/*
{
  id: number,
  lote: string,      // NOME do lote
  rz: string,
  volume: string | null
}
*/

// ---------- RUA ----------
/*
{
  nome: string,
  posicoes: Posicao[]
}
*/

// ---------- ÁREA ----------
/*
{
  nome: string,
  ruas: Rua[]
}
*/

// ---------- LOTE ----------
/*
{
  id: string,
  nome: string,
  total: number,
  expedidos: number,
  cor: string
}
*/

// ---------- HISTÓRICO DE EXPEDIÇÃO ----------
/*
{
  id: string,
  lote: string,
  quantidade: number,
  data: string,
  detalhes: {
    area: string,
    rua: string,
    posicao: number,
    rz: string,
    volume: string
  }[]
}
*/

// ---------- STATE GLOBAL ----------
window.state = {
  areas: [],              // Áreas do mapa
  lotes: [],              // Lotes ativos
  historicoExpedidos: []  // Histórico
};

// ---------- STORAGE ----------
const STORAGE_KEY = 'gaylord_state_v1';

// ---------- LOAD ----------
window.loadState = function () {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  try {
    const parsed = JSON.parse(data);
    state.areas = parsed.areas || [];
    state.lotes = parsed.lotes || [];
    state.historicoExpedidos = parsed.historicoExpedidos || [];
  } catch (e) {
    console.error('Erro ao carregar state', e);
  }
};

// ---------- SAVE ----------
window.saveState = function () {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      areas: state.areas,
      lotes: state.lotes,
      historicoExpedidos: state.historicoExpedidos
    })
  );
};

// ---------- HELPERS ----------
window.gerarCor = function () {
  return `hsl(${Math.random() * 360}, 70%, 70%)`;
};

window.criarLote = function (nome, total) {
  return {
    id: crypto.randomUUID(),
    nome,
    total,
    expedidos: 0,
    cor: gerarCor()
  };
};

window.criarArea = function (nome) {
  return {
    nome,
    ruas: []
  };
};

window.criarRua = function (nome, quantidade) {
  return {
    nome,
    posicoes: Array.from({ length: quantidade }, (_, i) => ({
      id: i + 1,
      lote: '',
      rz: '',
      volume: ''
    }))
  };
};

window.posicaoOcupada = function (pos) {
  return pos.lote && pos.lote !== '';
};
