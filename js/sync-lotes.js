// ===============================
// SYNC — LOTES (BANCO → STATE)
// ===============================

async function syncLotesDoBanco() {
  if (typeof carregarLotesDoBanco !== 'function') {
    console.warn('Função carregarLotesDoBanco não encontrada');
    return;
  }

  const lotesBanco = await carregarLotesDoBanco();

  if (!Array.isArray(lotesBanco)) return;

  // Limpa apenas os lotes locais
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

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
}
