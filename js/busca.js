// =======================================
// BUSCA.JS
// Busca e destaque de gaylords no mapa
// =======================================

// -------------------------------
// LIMPAR TODOS OS DESTAQUES
// (uso interno e inicialização)
// -------------------------------
window.limparDestaques = function () {
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos._highlight) {
          delete pos._highlight;
        }
      });
    });
  });
};

// -------------------------------
// BUSCAR
// -------------------------------
window.buscar = function () {
  const input = document.getElementById('buscaInput');
  const termo = input.value.trim().toLowerCase();

  if (!termo) {
    alert('Informe um termo para busca');
    return;
  }

  let encontrados = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (!pos.ocupada) {
          delete pos._highlight;
          return;
        }

        const match =
          (pos.lote && pos.lote.toLowerCase().includes(termo)) ||
          (pos.rz && pos.rz.toLowerCase().includes(termo)) ||
          (pos.volume && pos.volume.toLowerCase().includes(termo));

        if (match) {
          pos._highlight = true;
          encontrados++;
        } else {
          delete pos._highlight;
        }
      });
    });
  });

  if (encontrados === 0) {
    alert('Nenhum resultado encontrado');
  }

  renderMapa();
};

// -------------------------------
// LIMPAR BUSCA (BOTÃO)
// -------------------------------
window.limparBusca = function () {
  limparDestaques();

  const input = document.getElementById('buscaInput');
  if (input) input.value = '';

  renderMapa();
};
