// ===============================
// UTILS.JS — FUNÇÕES AUXILIARES (SUPABASE + UUID)
// ===============================


// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA (POR LOTE_ID)
// -------------------------------
window.contarGaylordsDoLote = function (loteId) {

  if (!loteId) return 0;
  if (!Array.isArray(state.areas)) return 0;

  let total = 0;

  state.areas.forEach(area => {

    if (!Array.isArray(area.ruas)) return;

    area.ruas.forEach(rua => {

      if (!Array.isArray(rua.posicoes)) return;

      rua.posicoes.forEach(pos => {

        // 🔥 AGORA COMPARA UUID
        if (pos?.ocupada === true && pos?.lote_id === loteId) {
          total++;
        }

      });

    });

  });

  return total;
};


// -------------------------------
// TOTAL EXPEDIDO DO LOTE (POR LOTE_ID)
// -------------------------------
window.totalExpedidoDoLote = function (loteId) {

  if (!loteId) return 0;
  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos
    .filter(h => h?.lote_id === loteId)
    .reduce((soma, h) => {

      if (!Array.isArray(h?.detalhes)) return soma;

      return soma + h.detalhes.length;

    }, 0);
};


// -------------------------------
// CONFIGURAR HEADER
// -------------------------------
window.configurarHeader = function (tipoTela) {

  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');

  const usuarioSpan = document.getElementById('usuarioHeader');
  const btnRelatorios = document.getElementById('btnRelatorios');
  const btnVoltar = document.getElementById('btnVoltar');

  if (usuarioSpan && usuario.usuario) {
    usuarioSpan.textContent = `Usuário: ${usuario.usuario}`;
  }

  // Tela principal
  if (tipoTela === 'sistema') {
    if (btnRelatorios) btnRelatorios.style.display = 'inline-block';
    if (btnVoltar) btnVoltar.style.display = 'none';
  }

  // Tela relatórios
  if (tipoTela === 'relatorios') {
    if (btnRelatorios) btnRelatorios.style.display = 'none';
    if (btnVoltar) btnVoltar.style.display = 'inline-block';
  }
};


// -------------------------------
// NAVEGAÇÃO
// -------------------------------
window.irRelatorios = function () {
  window.location.href = 'relatorios.html';
};

window.voltarSistema = function () {
  window.location.href = 'index.html';
};
