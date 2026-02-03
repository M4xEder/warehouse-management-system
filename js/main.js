// ===============================
// MAIN.JS
// Ponto de entrada da aplicação
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  // 1️⃣ Carrega estado salvo
  loadState();

  // 2️⃣ Garantias de estrutura (evita erro em state antigo)
  if (!Array.isArray(state.areas)) state.areas = [];
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.historicoExpedidos)) state.historicoExpedidos = [];

  // 3️⃣ Render inicial
  if (typeof renderMapa === 'function') renderMapa();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderExpedidos === 'function') renderExpedidos();

  console.log('Sistema Gaylords iniciado com sucesso');
});

// ===============================
// RESET (opcional para debug)
// ===============================
window.resetSistema = function () {
  if (!confirm('Deseja limpar TODOS os dados do sistema?')) return;
  localStorage.clear();
  location.reload();
};
