/* window.buscar = function () {
  const termo = document.getElementById('buscaInput').value.toLowerCase();
  document.querySelectorAll('.posicao').forEach(p => {
    p.classList.remove('highlight');
    if (termo && p.dataset?.info?.includes(termo)) {
      p.classList.add('highlight');
    }
  });
};

window.limparBusca = function () {
  document.querySelectorAll('.posicao').forEach(p => p.classList.remove('highlight'));
};

*/

// ===============================
// BUSCA.JS — LOTE | RZ | VOLUME
// ===============================

window.buscar = function () {
  const input = document.getElementById('buscaInput');
  if (!input) return;

  const termo = input.value.trim().toLowerCase();

  // limpa destaque anterior
  limparBusca();

  if (!termo) return;

  document.querySelectorAll('.posicao').forEach(posEl => {
    const title = (posEl.title || '').toLowerCase();

    if (title.includes(termo)) {
      posEl.classList.add('highlight');
    }
  });
};

window.limparBusca = function () {
  document
    .querySelectorAll('.posicao.highlight')
    .forEach(el => el.classList.remove('highlight'));
};
