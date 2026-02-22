document.addEventListener('DOMContentLoaded', async () => {

  console.log('🚀 Inicializando sistema...');

  try {
    await loadFromDatabase();
    renderMapa();
    renderDashboard();
  } catch (err) {
    console.error('❌ Erro na inicialização:', err);
  }

});
