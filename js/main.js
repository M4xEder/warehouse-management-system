// ===============================
// MAIN.JS — INICIALIZAÇÃO EMPRESARIAL
// ===============================

document.addEventListener('DOMContentLoaded', async () => {

  console.log('🚀 Inicializando sistema...');

  try {

    // 🔎 Verifica Supabase
    if (!window.supabaseClient) {
      throw new Error('SupabaseClient não inicializado.');
    }

    // 🔎 Verifica State
    if (!window.state) {
      throw new Error('State global não encontrado.');
    }

    // 🔎 Verifica função principal
    if (typeof carregarSistema !== 'function') {
      throw new Error('Função carregarSistema não encontrada.');
    }

    // 🔄 Carrega tudo
    await carregarSistema();

    console.log('✅ Sistema carregado com sucesso.');

  } catch (err) {

    console.error('❌ Erro na inicialização:', err);

    alert(`
Erro ao iniciar o sistema.
Verifique conexão com banco ou console do navegador.
    `);

  }

});



// ===============================
// PROTEÇÃO EXTRA (HOT RELOAD / DUPLICAÇÃO)
// ===============================

window.addEventListener('beforeunload', () => {

  if (typeof resetState === 'function') {
    resetState();
  }

});
