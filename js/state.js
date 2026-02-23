// ===============================
// STATE.JS — ESTADO GLOBAL PROFISSIONAL + REALTIME (FINAL)
// ===============================

window.state = {
  areas: [],
  ruas: [],
  posicoes: [],
  lotes: [],
  historicoExpedidos: [],
  carregando: false,
  realtimeAtivo: false
};

let realtimeChannel = null;



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

    if (typeof renderMapa === "function") {
      renderMapa();
    }

    if (typeof atualizarDashboard === "function") {
      atualizarDashboard();
    }

    if (!state.realtimeAtivo) {
      iniciarRealtime();
    }

  } catch (err) {

    console.error("Erro ao carregar sistema:", err);
    alert("Erro ao carregar dados do banco.");

  } finally {

    state.carregando = false;
  }
};



// ======================================
// REALTIME SUPABASE — PADRÃO EMPRESA
// ======================================
window.iniciarRealtime = function () {

  if (state.realtimeAtivo) return;

  realtimeChannel = window.supabaseClient
    .channel('sistema-realtime')

    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'areas'
    }, payload => handleRealtimeChange('areas', payload))

    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ruas'
    }, payload => handleRealtimeChange('ruas', payload))

    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'posicoes'
    }, payload => handleRealtimeChange('posicoes', payload))

    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'lotes'
    }, payload => handleRealtimeChange('lotes', payload))

    .subscribe((status) => {

      if (status === 'SUBSCRIBED') {
        console.log("🔥 Realtime conectado");
        state.realtimeAtivo = true;
      }

    });
};



// ======================================
// PROCESSADOR REALTIME INTELIGENTE
// ======================================
window.handleRealtimeChange = function (table, payload) {

  const evento = payload.eventType;
  const novo = payload.new;
  const antigo = payload.old;

  if (!state[table]) return;

  // =====================
  // INSERT
  // =====================
  if (evento === 'INSERT') {

    const jaExiste = state[table].some(item => item.id === novo.id);

    if (!jaExiste) {
      state[table].push(novo);
    }
  }

  // =====================
  // UPDATE (REFERÊNCIA PRESERVADA)
  // =====================
  if (evento === 'UPDATE') {

    const index = state[table].findIndex(item => item.id === novo.id);

    if (index !== -1) {
      Object.assign(state[table][index], novo);
    }
  }

  // =====================
  // DELETE
  // =====================
  if (evento === 'DELETE') {

    state[table] = state[table].filter(item => item.id !== antigo.id);
  }

  // =====================
  // RENDER OTIMIZADO
  // =====================
  if (table === 'posicoes' && typeof renderMapa === "function") {
    renderMapa();
  }

  if (table === 'lotes' && typeof atualizarDashboard === "function") {
    atualizarDashboard();
  }
};



// ======================================
// ATUALIZAÇÃO LOCAL OTIMISTA
// ======================================
window.atualizarPosicaoLocal = function (posicaoId, novosDados) {

  const pos = state.posicoes.find(p => p.id === posicaoId);
  if (!pos) return;

  Object.assign(pos, novosDados);

  if (typeof renderMapa === "function") {
    renderMapa();
  }
};



// ======================================
// RECARREGAMENTOS MANUAIS (FALLBACK)
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
// UTILITÁRIOS
// ======================================
window.getAreaById = id =>
  state.areas.find(a => a.id === id);

window.getRuaById = id =>
  state.ruas.find(r => r.id === id);

window.getPosicaoById = id =>
  state.posicoes.find(p => p.id === id);

window.getLoteById = id =>
  state.lotes.find(l => l.id === id);

window.areaTemRuas = areaId =>
  state.ruas.some(r => r.area_id === areaId);

window.ruaTemPosicoesOcupadas = ruaId =>
  state.posicoes.some(p => p.rua_id === ruaId && p.ocupada);



// ======================================
// RESET CONTROLADO
// ======================================
window.resetState = function () {

  state.areas = [];
  state.ruas = [];
  state.posicoes = [];
  state.lotes = [];
  state.historicoExpedidos = [];
  state.realtimeAtivo = false;

  if (realtimeChannel) {
    window.supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
};
