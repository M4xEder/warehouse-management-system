// =======================================
// STATE.JS — LOCAL + SUPABASE
// =======================================

const STORAGE_KEY = 'gaylords-system-state';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// ===============================
// LOAD STATE (SUPABASE → LOCAL)
// ===============================
async function loadState() {
  try {
    const lotesDoBanco = await carregarLotesDoBanco();

    if (lotesDoBanco.length > 0) {
      state.lotes = lotesDoBanco.map(lote => ({
        id: lote.id,
        nome: lote.nome,
        total: lote.total_gaylords,
        saldo: lote.total_gaylords,
        ativo: true,
        cor: `hsl(${Math.random() * 360},70%,65%)`
      }));
      console.log('✅ Lotes carregados do Supabase');
    } else {
      console.warn('⚠️ Nenhum lote no banco, fallback para localStorage');
      carregarLocal(false);
    }

    carregarLocal(false); // carrega áreas e histórico do local
  } catch (err) {
    console.error('❌ Erro loadState:', err);
    carregarLocal();
  }
}

// ===============================
// FALLBACK LOCAL
// ===============================
function carregarLocal(carregarLotes = true) {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const parsed = JSON.parse(data);

  state.areas = parsed.areas || [];
  state.historicoExpedidos = parsed.historicoExpedidos || [];

  if (carregarLotes) {
    state.lotes = (parsed.lotes || []).map(lote => ({
      id: lote.id || crypto.randomUUID(),
      nome: lote.nome,
      total: Number(lote.total) || 0,
      saldo: Number(lote.saldo ?? lote.total) || 0,
      ativo: lote.ativo ?? true,
      cor: lote.cor || `hsl(${Math.random() * 360},70%,65%)`
    }));
  }
}

// ===============================
// SAVE STATE (LOCAL)
// ===============================
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ===============================
// RESET
// ===============================
window.resetState = function () {
  if (!confirm('Deseja apagar TODOS os dados?')) return;
  localStorage.clear();
  location.reload();
};
