window.renderMapa = function () {
  const mapa = document.getElementById('mapa');
  mapa.innerHTML = '';

  state.areas.forEach(area => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';
    areaDiv.innerHTML = `<h3>${area.nome}</h3>`;

    area.ruas.forEach(rua => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      const posicoes = document.createElement('div');
      posicoes.className = 'posicoes';

      rua.posicoes.forEach(pos => {
        const p = document.createElement('div');
        p.className = 'posicao';
        if (pos.ocupada) p.classList.add('ocupada');
        p.onclick = () => abrirModal(pos);
        posicoes.appendChild(p);
      });

      ruaDiv.appendChild(posicoes);
      areaDiv.appendChild(ruaDiv);
    });

    mapa.appendChild(areaDiv);
  });
};
