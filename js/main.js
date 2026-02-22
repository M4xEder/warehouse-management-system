// ===============================
// MAIN.JS — INICIALIZAÇÃO FINAL
// ===============================

document.addEventListener('DOMContentLoaded', async () => {

  console.log('🚀 Inicializando sistema...');

  try {

    // Carregar sistema completo
    if (typeof carregarSistema === 'function') {
      await carregarSistema();
    } else {
      throw new Error('carregarSistema não encontrada');
    }

    console.log('🔥 Sistema pronto.');

  } catch (err) {
    console.error('❌ Erro na inicialização:', err);
  }

});
