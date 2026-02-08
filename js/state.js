// ===============================
// STATE.JS — ESTADO GLOBAL (ESTÁVEL)
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

// -------------------------------
// STATE PADRÃO
// -------------------------------
window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// -------------------------------
// NORMALIZAÇÃO (ANTI-ERRO)
// -------------------------------
function normalizarState(parsed) {
  return {
    areas: Array.isArray(parsed.areas)
      ? parsed.areas.map(area => ({
          id: area.id || crypto.randomUUID(),
          nome: area.nome || 'Área',
          ruas: Array.isArray(area.ruas)
            ? area.ruas.map(rua => ({
                id: rua.id || crypto.randomUUID(),
                nome: rua.nome || 'Rua',
                posicoes: Array.isArray(rua.posicoes)
                  ? rua.posicoes.map(pos => ({
                      ocupada: !!pos.ocupada,
                      lote: pos.lote || null,
                      rz: pos.rz || null,
                      volume: pos.volume || null
                    }))
                  : []
              }))
            : []
        }))
      : [],

    lotes: Array.isArray(parsed.lotes)
      ? parsed.lotes.map(l => ({
          id: l.id || crypto.randomUUID(),
          nome: l.nome,
          total: Number(l.total) || 0,
          ativo: l.ativo !== false,
          cor: l.cor || `hsl(${Math.random() * 360},70%,65%)`
        }))
      : [],

    historicoExpedidos: Array.isArray(parsed.historicoExpedidos)
      ? parsed.historicoExpedidos
      : []
  };
}

// -------------------------------
// CARREGAR STATE
// -------------------------------
window.loadState = function () {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const parsed = JSON.parse(data);
    const normalizado = normalizarState(parsed);

    state.areas = normalizado.areas;
    state.lotes = normalizado.lotes;
    state.historicoExpedidos = normalizado.historicoExpedidos;
  } catch (err) {
    console.error('Erro ao carregar state. Limpando storage.', err);
    localStorage.removeItem(STORAGE_KEY);
  }
};

// -------------------------------
// SALVAR STATE
// -------------------------------
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// -------------------------------
// INIT GLOBAL (OBRIGATÓRIO)
// -------------------------------
loadState();
