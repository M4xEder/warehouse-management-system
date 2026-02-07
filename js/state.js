// ===============================
// STATE.JS — LOCAL STORAGE PURO
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// -------------------------------
// LOAD
// -------------------------------
function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);

    state.areas = parsed.areas || [];
    state.historicoExpedidos = parsed.historicoExpedidos || [];

    state.lotes = (parsed.lotes || []).map(l => ({
      id: l.id || crypto.randomUUID(),
      nome: l.nome,
      total: Number(l.total) || 0,
      saldo: Number(l.saldo ?? l.total) || 0,
      ativo: l.ativo ?? true,
      cor: l.cor || gerarCor()
    }));

  } catch (e) {
    console.error('Erro ao carregar state:', e);
    localStorage.removeItem(STORAGE_KEY);
  }
}

// -------------------------------
// SAVE
// -------------------------------
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// -------------------------------
function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
}

// -------------------------------
window.resetState = function () {
  if (!confirm('Apagar todos os dados?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

window.recalcularSaldoLotes = function () {
  state.lotes.forEach(lote => {
    const expedidas = contarExpedidasDoLote(lote.nome);
    lote.saldo = Math.max(lote.total - expedidas, 0);
    lote.ativo = lote.saldo > 0;
  });
};

loadState();
