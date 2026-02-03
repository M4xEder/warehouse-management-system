// =======================================
// BUSCA.JS
// Busca e destaque de gaylords no mapa
// =======================================

window.buscar = function () {
  const termo = document
    .getElementById('buscaInput')
    .value
    .trim()
    .toLowerCase();

  if (!termo) {
    alert('Informe um termo para busca');
    return;
  }

  let encontrados = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (!pos.ocupada) return;

        const match =
          (pos.lote && pos.lote.toLowerCase().includes(termo)) ||
          (pos.rz && pos.rz.toLowerCase().includes(termo)) ||
          (pos.volume && pos.volume.toLowerCase().includes(termo));

        if (match) {
          pos._highlight = true;
          encontrados++;
        } else {
          pos._highlight = false;
        }
      });
    });
  });

  if (encontrados === 0) {
    alert('Nenhum resultado encontrado');
  }

  renderMapa();
};

// =======================================
// LIMPAR BUSCA
// =======================================

window.limparBusca = function () {
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        delete pos._highlight;
      });
    });
  });

  document.getElementById('buscaInput').value = '';
  renderMapa();
};
