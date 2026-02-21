// ===============================
// MAIN.JS — INICIALIZAÇÃO SISTEMA (VERSÃO FINAL)
// ===============================

document.addEventListener('DOMContentLoaded', async () => {

  console.log('🚀 Inicializando sistema...');

  // ===============================
  // CARREGAR HEADER
  // ===============================
  try {
    const response = await fetch('components/header.html');
    const data = await response.text();

    const container = document.getElementById('header-container');

    if (container) {
      container.innerHTML = data;

      if (typeof configurarHeader === 'function') {
        configurarHeader('sistema');
      }
    }

  } catch (err) {
    console.error('❌ Erro ao carregar header:', err);
  }


  // ===============================
  // 🔥 CARREGAR DADOS DO BANCO
  // ===============================
  try {

    if (typeof loadFromDatabase === 'function') {
      await loadFromDatabase();
      console.log('✅ Dados carregados do banco');
    }

  } catch (err) {
    console.error('❌ Erro ao carregar dados do banco:', err);
  }


  // ===============================
  // 🎨 RENDERIZAÇÕES
  // ===============================

  if (typeof renderMapa === 'function') {
    renderMapa();
  }

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  console.log('🔥 Sistema pronto.');

});
