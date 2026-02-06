// ===============================
// MAIN.JS — PONTO DE ENTRADA SEGURO
// ===============================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Inicializando sistema...');

  // -------------------------------
  // CARREGAR ESTADO LOCAL
  // -------------------------------
  if (typeof loadState === 'function') {
    loadState();
  } else {
    console.warn('loadState não encontrado');
    window.state = {};
  }

  // -------------------------------
  // GARANTIR ESTRUTURA DO STATE
  // -------------------------------
  if (!window.state) window.state = {};

  if (!Array.isArray(state.areas)) state.areas = [];
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.historicoExpedidos)) {
    state.historicoExpedidos = [];
  }

  // -------------------------------
  // LIMPAR ESTADOS VISUAIS
  // -------------------------------
  if (typeof limparDestaques === 'function') {
    limparDestaques();
  }

  // -------------------------------
  // RENDERIZAÇÕES (COM PROTEÇÃO)
  // -------------------------------
  try {
    if (typeof renderMapa === 'function') {
      renderMapa();
    }

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

    if (typeof renderExpedidos === 'function') {
      renderExpedidos();
    }
  } catch (err) {
    console.error('Erro ao renderizar interface:', err);
  }

  console.log('Sistema Gaylords iniciado com sucesso');
});

// -------------------------------
// RESET TOTAL (LOCAL)
// -------------------------------
window.resetSistema = function () {
  if (!confirm('Deseja limpar TODOS os dados do sistema?')) return;

  localStorage.clear();
  location.reload();
};
