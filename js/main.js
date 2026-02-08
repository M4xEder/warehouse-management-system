// ===============================
// MAIN.JS — ORQUESTRAÇÃO
// ===============================

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  renderMapa();
  renderDashboard();

  if (typeof renderLotesExpedidos === 'function') {
    renderLotesExpedidos();
  }
});
