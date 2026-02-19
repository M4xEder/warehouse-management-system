// ===============================
// UTILS.JS — FUNÇÕES AUXILIARES (VERSÃO SEGURA SUPABASE)
// ===============================


// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {

  if (!Array.isArray(state.areas)) return 0;

  let total = 0;

  state.areas.forEach(area => {

    if (!Array.isArray(area.ruas)) return;

    area.ruas.forEach(rua => {

      if (!Array.isArray(rua.posicoes)) return;

      rua.posicoes.forEach(pos => {
        if (pos?.ocupada && pos?.lote === nomeLote) {
          total++;
        }
      });

    });

  });

  return total;
};


// -------------------------------
// TOTAL EXPEDIDO DO LOTE
// -------------------------------
window.totalExpedidoDoLote = function (nomeLote) {

  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos
    .filter(h => h?.lote === nomeLote)
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
