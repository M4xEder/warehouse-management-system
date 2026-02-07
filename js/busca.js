// =======================================
// BUSCA.JS
// Busca e destaque de gaylords no mapa
// (APENAS LOTE E RZ)
// =======================================

// -------------------------------
// LIMPAR TODOS OS DESTAQUES
// -------------------------------
window.limparDestaques = function () {
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        delete pos._highlight;
      });
    });
  });
};

// -------------------------------
// BUSCAR (LOTE OU RZ)
// -------------------------------
window.buscar = function () {
  const input = document.getElementById('buscaInput');
  if (!input) return;

  const termo = input.value.trim().toLowerCase();

  if (!termo) {
    alert('Informe um lote ou RZ para buscar');
    return;
  }

  let encontrados = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        // Só busca posições ocupadas
        if (!pos.ocupada) {
          delete pos._highlight;
          return;
        }

        const match =
          (pos.lote && pos.lote.toLowerCase().includes(termo)) ||
          (pos.rz && pos.rz.toLowerCase().includes(termo));

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
