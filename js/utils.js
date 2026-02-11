// ===============================
// UTILS.JS — FUNÇÕES AUXILIARES
// ===============================

// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
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
    .filter(h => h.lote === nomeLote)
    .reduce((soma, h) => soma + h.detalhes.length, 0);
};

// -------------------------------
// cabecalho HEADER
// -------------------------------

function configurarHeader(tipoTela) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');

  const usuarioSpan = document.getElementById('usuarioHeader');
  const btnRelatorios = document.getElementById('btnRelatorios');
  const btnVoltar = document.getElementById('btnVoltar');

  if (usuarioSpan && usuario.usuario) {
    usuarioSpan.textContent = `Usuário: ${usuario.usuario}`;
  }

  // Tela principal do sistema
  if (tipoTela === 'sistema') {
    if (btnRelatorios) btnRelatorios.style.display = 'inline-block';
    if (btnVoltar) btnVoltar.style.display = 'none';
  }

  // Tela de relatórios
  if (tipoTela === 'relatorios') {
    if (btnRelatorios) btnRelatorios.style.display = 'none';
    if (btnVoltar) btnVoltar.style.display = 'inline-block';
  }
}

function irRelatorios() {
  window.location.href = 'relatorios.html';
}

function voltarSistema() {
  window.location.href = 'index.html';
}
