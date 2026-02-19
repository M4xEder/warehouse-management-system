// ===============================
// STATE.JS — ESTADO GLOBAL (SUPABASE)
// ===============================

// Fonte de verdade: Supabase
// State apenas espelho em memória

window.state = {
  areas: [],
//  ruas: [],
  lotes: [],
  historicoExpedidos: []
};


// ===============================
// CARREGAR DADOS DO BANCO
// ===============================
window.loadFromDatabase = async function () {
window.loadFromDatabase = async function () {
  if (!window.supabaseClient) {
    console.error("❌ supabaseClient não inicializado");
    return;
  }

  try {
    const { data: areas, error: errorAreas } =
      await supabaseClient.from('areas').select('*');
    
    //const { data: ruas, error: errorRuas } =
   //   await supabaseClient.from('ruas').select('*'):

    const { data: lotes, error: errorLotes } =
      await supabaseClient.from('lotes').select('*');

    if (errorAreas || errorLotes) {
      console.error("Erro Supabase:", errorAreas || errorLotes);
      return;
    }

    state.areas = areas || [];
  //  state.areas = ruas || [];
    state.lotes = lotes || [];

    console.log("✅ Dados carregados do banco");
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
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
