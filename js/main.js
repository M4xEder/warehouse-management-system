// ===============================
// MAIN.JS — INICIALIZAÇÃO FINAL
// ===============================

document.addEventListener('DOMContentLoaded', async () => {

  console.log('🚀 Inicializando sistema...');

  try {

    if (typeof carregarSistema !== 'function') {
      throw new Error('Função carregarSistema não encontrada');
    }

    await carregarSistema();

    console.log('✅ Sistema carregado com sucesso.');

  } catch (err) {
    console.error('❌ Erro na inicialização:', err);
  }

});
