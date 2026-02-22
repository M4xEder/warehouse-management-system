// ===============================
// STATE.JS — ESTADO GLOBAL DA APLICAÇÃO
// ===============================
//
// Responsabilidade:
// - Manter dados em memória
// - Carregar dados do Supabase
// - Atualizar estado após operações
// - Nunca acessar banco direto (usa model.js)
//
// ===============================


// ======================================
// ESTADO GLOBAL
// ======================================

window.state = {
  areas: [],
  ruas: [],
  posicoes: [],
  lotes: [],
  historicoExpedidos: [],
  carregando: false
};



// ======================================
// CARREGAR TODOS OS DADOS DO BANCO
// ======================================

window.carregarSistema = async function () {

  try {
    state.carregando = true;

    const [
      areasRes,
      ruasRes,
      posRes,
      lotesRes,
      histRes
    ] = await Promise.all([
      dbBuscarAreas(),
      dbBuscarRuas(),
      dbBuscarPosicoes(),
      dbBuscarLotes(),
      dbBuscarHistorico()
    ]);

    if (areasRes.error) throw areasRes.error;
    if (ruasRes.error) throw ruasRes.error;
    if (posRes.error) throw posRes.error;
    if (lotesRes.error) throw lotesRes.error;
    if (histRes.error) throw histRes.error;

    state.areas = areasRes.data || [];
    state.ruas = ruasRes.data || [];
    state.posicoes = posRes.data || [];
    state.lotes = lotesRes.data || [];
    state.historicoExpedidos = histRes.data || [];

    console.log("Sistema carregado com sucesso");

    if (typeof renderMapa === "function") {
      renderMapa();
    }

    if (typeof atualizarDashboard === "function") {
      atualizarDashboard();
    }

  } catch (err) {
    console.error("Erro ao carregar sistema:", err);
    alert("Erro ao carregar dados do banco.");
  } finally {
    state.carregando = false;
  }
};



// ======================================
// RECARREGAR SOMENTE POSIÇÕES
// ======================================

window.recarregarPosicoes = async function () {

  const { data, error } = await dbBuscarPosicoes();

  if (error) {
    console.error("Erro ao recarregar posições:", error);
    return;
  }

  state.posicoes = data || [];

  if (typeof renderMapa === "function") {
    renderMapa();
  }
};



// ======================================
// RECARREGAR SOMENTE LOTES
// ======================================

window.recarregarLotes = async function () {

  const { data, error } = await dbBuscarLotes();

  if (error) {
    console.error("Erro ao recarregar lotes:", error);
    return;
  }

  state.lotes = data || [];

  if (typeof atualizarDashboard === "function") {
    atualizarDashboard();
  }
};



// ======================================
// RECARREGAR HISTÓRICO
// ======================================

window.recarregarHistorico = async function () {

  const { data, error } = await dbBuscarHistorico();

  if (error) {
    console.error("Erro ao recarregar histórico:", error);
    return;
  }

  state.historicoExpedidos = data || [];

  if (typeof atualizarDashboard === "function") {
    atualizarDashboard();
  }
};



// ======================================
// BUSCAR ENTIDADES EM MEMÓRIA
// ======================================

window.getAreaById = function (id) {
  return state.areas.find(a => a.id === id);
};

window.getRuaById = function (id) {
  return state.ruas.find(r => r.id === id);
};

window.getPosicaoById = function (id) {
  return state.posicoes.find(p => p.id === id);
};

window.getLoteById = function (id) {
  return state.lotes.find(l => l.id === id);
};



// ======================================
// VALIDAÇÕES DE EXCLUSÃO
// ======================================

// Não permitir excluir área se tiver ruas
window.areaTemRuas = function (areaId) {
  return state.ruas.some(r => r.area_id === areaId);
};

// Não permitir excluir rua se tiver posições ocupadas
window.ruaTemPosicoesOcupadas = function (ruaId) {
  return state.posicoes.some(p => p.rua_id === ruaId && p.ocupada);
};



// ======================================
// UTILIDADES
// ======================================

window.resetState = function () {
  state.areas = [];
  state.ruas = [];
  state.posicoes = [];
  state.lotes = [];
  state.historicoExpedidos = [];
};
