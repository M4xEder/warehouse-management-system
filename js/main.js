// ===============================
// MAIN.JS — PONTO DE ENTRADA
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  if (!Array.isArray(state.areas)) state.areas = [];
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.historicoExpedidos))
    state.historicoExpedidos = [];

  //  LIMPA ESTADOS VISUAIS TEMPORÁRIOS
  if (typeof limparDestaques === 'function') {
    limparDestaques();
  }

  if (typeof renderMapa === 'function') renderMapa();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderExpedidos === 'function') renderExpedidos();

  console.log('Sistema Gaylords iniciado com sucesso');
});

window.resetSistema = function () {
  if (!confirm('Deseja limpar TODOS os dados do sistema?')) return;
  localStorage.clear();
  location.reload();
};
