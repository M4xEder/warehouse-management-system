// ===============================
// STATE.JS — ESTADO GLOBAL (SUPABASE)
// ===============================

window.state = {
  areas: [],
  ruas: [],
  lotes: []
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

    if (errorAreas || errorRuas || errorLotes) {
      console.error("❌ Erro Supabase:",
        errorAreas || errorRuas || errorLotes
      );
      return;
    }

    state.areas = areas || [];
    state.ruas = ruas || [];
    state.lotes = lotes || [];

    console.log("✅ Dados carregados do banco");

  } catch (err) {
    console.error("❌ Erro ao carregar dados:", err);
  }
};
