// ===============================
// MAIN.JS — ORQUESTRAÇÃO FINAL
// ===============================

document.addEventListener('DOMContentLoaded', () => {

  // STATE já foi carregado pelo state.js
  // Aqui apenas renderizamos

  if (typeof renderMapa === 'function') {
    renderMapa();
  }

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  if (typeof renderLotesExpedidos === 'function') {
    renderLotesExpedidos();
  }

});
