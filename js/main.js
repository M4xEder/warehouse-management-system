// ===============================
// MAIN.JS — PONTO DE ENTRADA
// ===============================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Iniciando sistema...');

  // 1️⃣ Carrega dados locais
  loadState();

  if (!Array.isArray(state.areas)) state.areas = [];
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.historicoExpedidos)) {
    state.historicoExpedidos = [];
  }

  // 2️⃣ SINCRONIZA LOTES DO SUPABASE (OPÇÃO A)
  if (typeof carregarLotesDoBanco === 'function') {
    try {
      const lotesBanco = await carregarLotesDoBanco();

      if (Array.isArray(lotesBanco)) {
        state.lotes = [];

        lotesBanco.forEach(l => {
          state.lotes.push({
            id: l.id,
            nome: l.nome,
            total: l.total_gaylords,
            saldo: l.total_gaylords, // por enquanto
            ativo: true,
            cor: gerarCor()
          });
        });

        saveState();
        console.log('Lotes sincronizados no state');
      }
    } catch (e) {
      console.error('Falha ao sincronizar lotes:', e);
    }
  }

  // 3️⃣ LIMPA ESTADOS VISUAIS TEMPORÁRIOS
  if (typeof limparDestaques === 'function') {
    limparDestaques();
  }

  // 4️⃣ RENDERIZA TELAS
  if (typeof renderMapa === 'function') renderMapa();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderExpedidos === 'function') renderExpedidos();

  console.log('Sistema Gaylords iniciado com sucesso');
});

// ===============================
// RESET TOTAL (LOCAL)
// ===============================
window.resetSistema = function () {
  if (!confirm('Deseja limpar TODOS os dados locais do sistema?')) return;
  localStorage.clear();
  location.reload();
};
