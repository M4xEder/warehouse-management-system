// ==================================
// MAIN.JS — INIT DO SISTEMA
// ==================================

document.addEventListener('DOMContentLoaded', () => {
  // 1️⃣ carrega dados
  loadState();

  // 2️⃣ render inicial
  if (typeof renderMapa === 'function') {
    renderMapa();
  }

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  if (typeof renderHistorico === 'function') {
    renderHistorico();
  }
});
