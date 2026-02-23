// =======================================
// BUSCA.JS
// Busca e destaque no mapa
// (LOTE via lote_id + RZ)
// MODELO ATUAL BLINDADO
// =======================================


// --------------------------------------------------
// LIMPAR DESTAQUES
// --------------------------------------------------
window.limparDestaques = function () {

  if (!state?.posicoes) return;

  state.posicoes.forEach(pos => {
    delete pos._highlight;
  });
};



// --------------------------------------------------
// BUSCAR (LOTE OU RZ)
// --------------------------------------------------
window.buscar = function () {

  const input = document.getElementById('buscaInput');
  if (!input) return;

  const termo = input.value?.trim().toLowerCase();

  if (!termo) {
    alert('Informe um lote ou RZ para buscar');
    return;
  }

  if (!state?.posicoes || !state?.lotes) {
    alert('Dados ainda não carregados');
    return;
  }

  let encontrados = 0;

  state.posicoes.forEach(pos => {

    // Só busca posições ocupadas
    if (!pos?.ocupada) {
      delete pos._highlight;
      return;
    }

    // Busca nome do lote via relacionamento
    let nomeLote = '';

    if (pos.lote_id) {
      const lote = state.lotes.find(l => l.id === pos.lote_id);
      nomeLote = lote?.nome?.toLowerCase() || '';
    }

    const rz = pos?.rz?.toLowerCase() || '';

    const match =
      nomeLote.includes(termo) ||
      rz.includes(termo);

    if (match) {
      pos._highlight = true;
      encontrados++;
    } else {
      delete pos._highlight;
    }

  });

  if (encontrados === 0) {
    alert('Nenhum resultado encontrado');
  }

  if (typeof renderMapa === 'function') {
    renderMapa();
  }
};



// --------------------------------------------------
// LIMPAR BUSCA
// --------------------------------------------------
window.limparBusca = function () {

  limparDestaques();

  const input = document.getElementById('buscaInput');
  if (input) input.value = '';

  if (typeof renderMapa === 'function') {
    renderMapa();
  }
};
