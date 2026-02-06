// ===============================
// STATE.JS — LOCAL + SUPABASE
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

// ===============================
// ESTADO GLOBAL
// ===============================
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
    // 1️⃣ BUSCAR LOTES DO SUPABASE
    const { data: lotesDB, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.warn('Supabase indisponível, usando localStorage', error);
      carregarLocal();
      return;
    }

    // 2️⃣ NORMALIZAR LOTES DO BANCO
    state.lotes = lotesDB.map(lote => ({
      id: lote.id,
      nome: lote.nome,
      total: lote.total_gaylords,
      saldo: lote.total_gaylords,
      ativo: true,
      cor: gerarCorFallback()
    }));

    // 3️⃣ ÁREAS E HISTÓRICO (ainda local)
    carregarLocal(false);

    console.log('State carregado do Supabase');

  } catch (err) {
    console.error('Erro geral loadState:', err);
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
      cor: lote.cor || gerarCorFallback()
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

// ===============================
// COR FALLBACK
// ===============================
function gerarCorFallback() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// ===============================
// INIT
// ===============================
loadState();
