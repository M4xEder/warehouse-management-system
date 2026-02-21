// ===============================
// STATE.JS — ESTADO GLOBAL (SUPABASE DEFINITIVO)
// ===============================

window.state = {
  areas: [],
  ruas: [],
  lotes: [],
  historicoExpedidos: [] // mantém compatibilidade com dashboard
};


// ===============================
// RESETAR ESTADO
// ===============================
window.resetState = function () {
  state.areas = [];
  state.ruas = [];
  state.lotes = [];
  state.historicoExpedidos = [];
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

    // 🔥 Limpa estado antes de carregar
    resetState();

    const { data: areas, error: errorAreas } =
      await window.supabaseClient
        .from('areas')
        .select('*')
        .order('created_at', { ascending: true });

    const { data: ruas, error: errorRuas } =
      await window.supabaseClient
        .from('ruas')
        .select('*')
        .order('created_at', { ascending: true });

    const { data: lotes, error: errorLotes } =
      await window.supabaseClient
        .from('lotes')
        .select('*')
        .order('created_at', { ascending: true });

    if (errorAreas || errorRuas || errorLotes) {
      console.error(
        "❌ Erro Supabase:",
        errorAreas || errorRuas || errorLotes
      );
      return;
    }

    state.areas = areas || [];
    state.ruas = ruas || [];
    state.lotes = lotes || [];

    console.log("✅ Dados carregados com sucesso");

  } catch (err) {
    console.error("❌ Erro geral ao carregar dados:", err);
  }
};
