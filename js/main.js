// ===============================
// MAIN.JS — PONTO DE ENTRADA (ASYNC)
// ===============================

document.addEventListener('DOMContentLoaded', async () => {

  // ⏳ ESPERA carregar do Supabase
  if (typeof loadState === 'function') {
    await loadState();
  }

  if (!Array.isArray(state.areas)) state.areas = [];
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.historicoExpedidos))
    state.historicoExpedidos = [];

  // LIMPA VISUAIS
  if (typeof limparDestaques === 'function') {
    limparDestaques();
  }

  // RENDERIZA APÓS DADOS
  if (typeof renderMapa === 'function') renderMapa();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderExpedidos === 'function') renderExpedidos();

  console.log('Sistema iniciado com dados do Supabase');
});

window.resetSistema = function () {
  if (!confirm('Deseja limpar TODOS os dados do sistema?')) return;
  localStorage.clear();
  location.reload();
};
