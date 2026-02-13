/* document.addEventListener('DOMContentLoaded', () => {
  renderMapa();
  renderDashboard();
  if (typeof renderLotesExpedidos === 'function') {
    renderLotesExpedidos();
  }
}); */

document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // CARREGAR HEADER
  // ===============================
  fetch('components/header.html')
    .then(response => response.text())
    .then(data => {
      const container = document.getElementById('header-container');
      if (container) {
        container.innerHTML = data;

        // Depois que o header existe no DOM
        configurarHeader('sistema');
      }
    })
    .catch(err => console.error('Erro ao carregar header:', err));


  // ===============================
  // RENDERIZAÇÕES
  // ===============================
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
