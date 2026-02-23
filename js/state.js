// ===============================
// STATE.JS — ESTADO GLOBAL PROFISSIONAL
// ===============================

window.state = {
  areas: [],
  ruas: [],
  posicoes: [],
  lotes: [],
  historicoExpedidos: [],
  carregando: false
};



// ======================================
// CARREGAR TODOS OS DADOS
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

    console.log("✅ Sistema carregado com sucesso");

    renderMapa();
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
// RECARREGAR POSIÇÕES (COM RENDER AUTOMÁTICO)
// ======================================
window.recarregarPosicoes = async function () {

  const { data, error } = await dbBuscarPosicoes();

  if (error) {
    console.error("Erro ao recarregar posições:", error);
    return;
  }

  state.posicoes = data || [];

  renderMapa();
};



// ======================================
// RECARREGAR LOTES
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
// ATUALIZAÇÃO LOCAL OTIMISTA (🔥 IMPORTANTE)
// ======================================
window.atualizarPosicaoLocal = function (posicaoId, novosDados) {

  const pos = state.posicoes.find(p => p.id === posicaoId);
  if (!pos) return;

  Object.assign(pos, novosDados);

  renderMapa();
};



// ======================================
// UTILITÁRIOS
// ======================================
window.getPosicaoById = function (id) {
  return state.posicoes.find(p => p.id === id);
};

window.getLoteById = function (id) {
  return state.lotes.find(l => l.id === id);
};

window.areaTemRuas = function (areaId) {
  return state.ruas.some(r => r.area_id === areaId);
};

window.ruaTemPosicoesOcupadas = function (ruaId) {
  return state.posicoes.some(p => p.rua_id === ruaId && p.ocupada);
};
