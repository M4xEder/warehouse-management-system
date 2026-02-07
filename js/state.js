// ===============================
// STATE.JS — CONTROLE DE ESTADO
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);

    state.areas = parsed.areas || [];
    state.historicoExpedidos = parsed.historicoExpedidos || [];

    // garante compatibilidade
    state.lotes = (parsed.lotes || []).map(l => ({
      id: l.id || crypto.randomUUID(),
      nome: l.nome,
      total: Number(l.total),
      cor: l.cor || '#999',
      finalizado: l.finalizado === true
    }));

  } catch (e) {
    console.error(e);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

loadState();
