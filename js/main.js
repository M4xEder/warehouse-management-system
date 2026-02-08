document.addEventListener('DOMContentLoaded', () => {
  renderMapa();
  renderDashboard();
  if (typeof renderLotesExpedidos === 'function') {
    renderLotesExpedidos();
  }
});
