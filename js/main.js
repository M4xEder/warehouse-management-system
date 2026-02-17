/* document.addEventListener('DOMContentLoaded', () => {
  renderMapa();
  renderDashboard();
  if (typeof renderLotesExpedidos === 'function') {
    renderLotesExpedidos();
  }
}); */

document.addEventListener('DOMContentLoaded', async () => {

  // ===============================
  // CARREGAR HEADER
  // ===============================
  try {
    const response = await fetch('components/header.html');
    const data = await response.text();

    const container = document.getElementById('header-container');
    if (container) {
      container.innerHTML = data;

      // Depois que o header existe no DOM
      if (typeof configurarHeader === 'function') {
        configurarHeader('sistema');
      }
    }
  } catch (err) {
    console.error('Erro ao carregar header:', err);
  }


  // ===============================
  // 🔥 CARREGAR LOTES DO BANCO
  // ===============================
  if (typeof carregarLotesDoBanco === 'function') {
    await carregarLotesDoBanco();
  }


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
