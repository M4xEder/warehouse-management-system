// ======================================================
// STATE.JS — ENTERPRISE DEFINITIVO ULTRA BLINDADO
// ======================================================

// ======================================
// NORMALIZADOR GLOBAL DE ID
// ======================================
function idEquals(a, b) {
  return String(a) === String(b);
}

function normalizeId(obj) {
  if (!obj) return obj;
  if (obj.id !== undefined) obj.id = String(obj.id);
  if (obj.lote_id !== undefined) obj.lote_id = String(obj.lote_id);
  if (obj.rua_id !== undefined) obj.rua_id = String(obj.rua_id);
  if (obj.area_id !== undefined) obj.area_id = String(obj.area_id);
  return obj;
}

// ======================================
// ESTADO GLOBAL
// ======================================
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
// CARREGAR SISTEMA (ANTI CORRUPÇÃO)
// ======================================
window.carregarSistema = async function () {

  if (state.carregando) return;

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

    // 🔥 NORMALIZA TUDO
    state.areas = (areasRes.data || []).map(normalizeId);
    state.ruas = (ruasRes.data || []).map(normalizeId);
    state.posicoes = (posRes.data || []).map(normalizeId);
    state.lotes = (lotesRes.data || []).map(normalizeId);
    state.historicoExpedidos = (histRes.data || []).map(normalizeId);

    console.log("✅ Sistema carregado blindado");

    if (typeof renderMapa === "function") renderMapa();
    if (typeof atualizarDashboard === "function") atualizarDashboard();

    if (!state.realtimeAtivo) iniciarRealtime();

  } catch (err) {

    console.error("❌ Erro ao carregar sistema:", err);
    alert("Erro ao carregar dados do banco.");

  } finally {
    state.carregando = false;
  }
};

// ======================================
// REALTIME ENTERPRISE
// ======================================
window.iniciarRealtime = function () {

  if (state.realtimeAtivo) return;

  realtimeChannel = window.supabaseClient
    .channel('sistema-realtime')

    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: '*'
    }, payload => {

      const tabela = payload.table;
      handleRealtimeChange(tabela, payload);

    })

    .subscribe(status => {

      if (status === 'SUBSCRIBED') {
        console.log("🔥 Realtime conectado enterprise");
        state.realtimeAtivo = true;
      }

    });
};

// ======================================
// PROCESSADOR REALTIME 100% SEGURO
// ======================================
window.handleRealtimeChange = function (table, payload) {

  if (!state[table]) return;

  const evento = payload.eventType;
  const novo = normalizeId(payload.new);
  const antigo = normalizeId(payload.old);

  // INSERT
  if (evento === 'INSERT') {

    const existe = state[table].some(item =>
      idEquals(item.id, novo.id)
    );

    if (!existe) state[table].push(novo);
  }

  // UPDATE
  if (evento === 'UPDATE') {

    const index = state[table].findIndex(item =>
      idEquals(item.id, novo.id)
    );

    if (index !== -1) {
      Object.assign(state[table][index], novo);
    }
  }

  // DELETE
  if (evento === 'DELETE') {

    state[table] = state[table].filter(item =>
      !idEquals(item.id, antigo.id)
    );
  }

  // RENDER INTELIGENTE
  if (table === 'posicoes' && typeof renderMapa === "function") {
    renderMapa();
  }

  if (
    (table === 'lotes' || table === 'historico_expedidos') &&
    typeof atualizarDashboard === "function"
  ) {
    atualizarDashboard();
  }
};

// ======================================
// GETTERS 100% SEGUROS
// ======================================
window.getAreaById = id =>
  state.areas.find(a => idEquals(a.id, id));

window.getRuaById = id =>
  state.ruas.find(r => idEquals(r.id, id));

window.getPosicaoById = id =>
  state.posicoes.find(p => idEquals(p.id, id));

window.getLoteById = id =>
  state.lotes.find(l => idEquals(l.id, id));

// ======================================
// VERIFICAÇÕES
// ======================================
window.areaTemRuas = areaId =>
  state.ruas.some(r => idEquals(r.area_id, areaId));

window.ruaTemPosicoesOcupadas = ruaId =>
  state.posicoes.some(p =>
    idEquals(p.rua_id, ruaId) && p.ocupada === true
  );

// ======================================
// RESET TOTAL CONTROLADO
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

  console.log("🔄 Estado resetado com segurança");
};
