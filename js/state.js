// ===============================
// STATE.JS — ESTADO GLOBAL (SUPABASE)
// ===============================

// Fonte de verdade: Supabase
// State apenas espelho em memória

window.state = {
  areas: [],
  ruas: [],
  lotes: [],
  historicoExpedidos: []
};


// ===============================
// CARREGAR DADOS DO BANCO
// ===============================
window.loadFromDatabase = async function () {

  if (typeof supabase === 'undefined') {
    console.error('Supabase não carregado');
    return;
  }

  try {

    const { data: areas, error: errAreas } =
      await supabase.from('areas').select('*');

    if (errAreas) throw errAreas;

    const { data: ruas, error: errRuas } =
      await supabase.from('ruas').select('*');

    if (errRuas) throw errRuas;

    const { data: lotes, error: errLotes } =
      await supabase.from('lotes').select('*');

    if (errLotes) throw errLotes;

    state.areas = areas || [];
    state.ruas = ruas || [];
    state.lotes = lotes || [];

    if (typeof renderMapa === 'function') {
      renderMapa();
    }

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

    console.log('✅ Dados carregados do Supabase');

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
};


// ===============================
// RECARREGAR DADOS
// ===============================
window.reloadData = async function () {
  await loadFromDatabase();
};


// ===============================
// RESETAR ESTADO (DEBUG)
// ===============================
window.resetState = function () {

  state.areas = [];
  state.ruas = [];
  state.lotes = [];
  state.historicoExpedidos = [];

  console.warn('⚠ Estado resetado (memória apenas)');
};


// ===============================
// LOGAR ESTADO (DEBUG)
// ===============================
window.logState = function () {
  console.log('STATE ATUAL:',
    JSON.parse(JSON.stringify(state))
  );
};
