// ===============================
// STATE.JS — ESTADO GLOBAL
// ===============================

window.state = {
  areas: [],
  ruas: [],
  posicoes: [],
  lotes: [],
  historicoExpedidos: []
};


// ===============================
// RESET
// ===============================
window.resetState = function () {
  state.areas = [];
  state.ruas = [];
  state.posicoes = [];
  state.lotes = [];
  state.historicoExpedidos = [];
};


// ===============================
// LOAD DATABASE
// ===============================
window.loadFromDatabase = async function () {

  if (!window.supabaseClient) {
    throw new Error("Supabase não inicializado");
  }

  resetState();

  const [
    { data: areas, error: e1 },
    { data: ruas, error: e2 },
    { data: posicoes, error: e3 },
    { data: lotes, error: e4 }
  ] = await Promise.all([
    supabaseClient.from('areas').select('*').order('created_at'),
    supabaseClient.from('ruas').select('*').order('created_at'),
    supabaseClient.from('posicoes').select('*').order('numero'),
    supabaseClient.from('lotes').select('*').order('created_at')
  ]);

  if (e1 || e2 || e3 || e4) {
    throw e1 || e2 || e3 || e4;
  }

  state.areas = areas || [];
  state.ruas = ruas || [];
  state.posicoes = posicoes || [];
  state.lotes = lotes || [];

  console.log('✅ Dados carregados do Supabase');
};
