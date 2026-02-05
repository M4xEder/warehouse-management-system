// ===============================
// STATE.JS — CONTROLE DE ESTADO
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
// LOAD STATE
// ===============================
function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);

    state.areas = parsed.areas || [];
    state.historicoExpedidos = parsed.historicoExpedidos || [];

    // 🔴 NORMALIZA LOTES ANTIGOS
    state.lotes = (parsed.lotes || []).map(lote => {
      return {
        id: lote.id || crypto.randomUUID(),
        nome: lote.nome,
        total: Number(lote.total) || 0,

        // 👉 NOVOS CAMPOS (compatível com dados antigos)
        saldo:
          lote.saldo !== undefined
            ? Number(lote.saldo)
            : Number(lote.total) || 0,

        ativo:
          lote.ativo !== undefined
            ? lote.ativo
            : (Number(lote.saldo ?? lote.total) > 0),

        cor: lote.cor || gerarCorFallback()
      };
    });

  } catch (err) {
    console.error('Erro ao carregar state:', err);
    alert('Erro ao carregar dados salvos. O sistema será reiniciado.');
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ===============================
// SAVE STATE
// ===============================
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Erro ao salvar state:', err);
    alert('Erro ao salvar dados.');
  }
}

// ===============================
// RESET (DEBUG)
// ===============================
window.resetState = function () {
  if (!confirm('Deseja apagar TODOS os dados?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

// ===============================
// COR DE SEGURANÇA (fallback)
// ===============================
function gerarCorFallback() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// ===============================
// INIT AUTOMÁTICO
// ===============================
loadState();
