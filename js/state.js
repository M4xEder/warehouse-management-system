// ===============================
// STATE.JS — ESTADO GLOBAL (SUPABASE)
// ===============================

// Fonte de verdade: Supabase
// State é apenas espelho em memória

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

  if (!window.supabaseClient) {
    console.error("❌ supabaseClient não inicializado");
    return;
  }

  try {

    console.log("🔄 Carregando dados do banco...");

    const { data: areas, error: errorAreas } =
      await supabaseClient.from('areas').select('*');

    const { data: ruas, error: errorRuas } =
      await supabaseClient.from('ruas').select('*');

    const { data: lotes, error: errorLotes } =
      await supabaseClient.from('lotes').select('*');

    const { data: historico, error: errorHistorico } =
      await supabaseClient.from('historico_expedidos').select('*');

    if (errorAreas || errorRuas || errorLotes || errorHistorico) {
      console.error("❌ Erro Supabase:",
        errorAreas || errorRuas || errorLotes || errorHistorico
      );
      return;
    }

    // Segurança contra undefined
    state.areas = Array.isArray(areas) ? areas : [];
    state.ruas = Array.isArray(ruas) ? ruas : [];
    state.lotes = Array.isArray(lotes) ? lotes : [];
    state.historicoExpedidos = Array.isArray(historico) ? historico : [];

    console.log("✅ Dados carregados do banco com sucesso");

  } catch (err) {
    console.error("❌ Erro ao carregar dados:", err);
  }
};


// ===============================
// RECARREGAR DADOS
// ===============================
window.reloadData = async function () {
  await window.loadFromDatabase();
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
  console.log('📦 STATE ATUAL:',
    JSON.parse(JSON.stringify(state))
  );
};
