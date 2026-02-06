// ===============================
// STATE.JS — ESTÁVEL + SUPABASE SAFE
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
    if (typeof window.supabase === 'undefined') {
      console.warn('Supabase não disponível, usando localStorage');
      carregarLocal();
      return;
    }

    const { data: lotesDB, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.warn('Erro Supabase, fallback local', error);
      carregarLocal();
      return;
    }

    // NORMALIZA LOTES
    state.lotes = lotesDB.map(lote => ({
      id: lote.id,
      nome: lote.nome,
      total: Number(lote.total_gaylords) || 0,
      saldo: Number(lote.total_gaylords) || 0,
      ativo: true,
      cor: gerarCorFallback()
    }));

    // AREAS + HISTÓRICO LOCAL
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

  try {
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
  } catch (e) {
    console.error('Erro ao carregar localStorage', e);
  }
}

// ===============================
// SAVE STATE
// ===============================
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

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
// INIT SEGURO
// ===============================
(function aguardarSupabase() {
  if (typeof window.supabase === 'undefined') {
    setTimeout(aguardarSupabase, 100);
    return;
  }
  loadState();
})();
