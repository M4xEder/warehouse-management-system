// ===============================
// BUSCA.JS
// Busca e destaque no mapa
// ===============================

window.buscar = function () {
  const termo = document
    .getElementById('buscaInput')
    .value
    .trim()
    .toLowerCase();

  if (!termo) {
    alert('Digite algo para buscar');
    return;
  }

  let encontrou = false;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(posicao => {
        if (!posicao.ocupada) return;

        const match =
          (posicao.lote && posicao.lote.toLowerCase().includes(termo)) ||
          (posicao.rz && posicao.rz.toLowerCase().includes(termo)) ||
          (posicao.volume && posicao.volume.toLowerCase().includes(termo));

        if (match) {
          posicao.highlight = true;
          encontrou = true;
        } else {
          posicao.highlight = false;
        }
      });
    });
  });

  if (!encontrou) {
    alert('Nenhum resultado encontrado');
  }

  renderMapa();
};

// ===============================
// LIMPAR DESTAQUE
// ===============================
window.limparBusca = function () {
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(posicao => {
        delete posicao.highlight;
      });
    });
  });

  document.getElementById('buscaInput').value = '';
  renderMapa();
};
