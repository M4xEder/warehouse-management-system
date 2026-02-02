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

window.buscar = function () {
  const termo = document.getElementById('buscaInput').value.toLowerCase();

  document.querySelectorAll('.posicao').forEach(p => {
    p.classList.remove('highlight');

    const info = p.title?.toLowerCase() || '';
    if (termo && info.includes(termo)) {
      p.classList.add('highlight');
    }
  });
};
