// ===============================
// MAPA.JS — ESTÁVEL
// ===============================

function criarPosicao() {
  return {
    ocupada: false,
    lote: null,
    rz: null,
    volume: null
  };
}

function criarRua(nome, qtd) {
  return {
    id: crypto.randomUUID(),
    nome,
    posicoes: Array.from({ length: qtd }, criarPosicao)
  };
}

function criarArea(nome) {
  return {
    id: crypto.randomUUID(),
    nome,
    ruas: []
  };
}

// -------------------------------
window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  const nome = input.value.trim();
  if (!nome) return alert('Informe o nome');

  state.areas.push(criarArea(nome));
  input.value = '';
  saveState();
  renderMapa();
};

// -------------------------------
window.renderMapa = function () {
  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  mapa.innerHTML = '';

  state.areas.forEach(area => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';
    areaDiv.innerHTML = `<strong>${area.nome}</strong>`;

    area.ruas.forEach(rua => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';
      ruaDiv.innerHTML = `Rua ${rua.nome}`;

      const posDiv = document.createElement('div');
      posDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, i) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        if (pos.ocupada) {
          const lote = state.lotes.find(l => l.nome === pos.lote);
          if (lote) p.style.background = lote.cor;
        }

        p.onclick = () => {
          if (pos.ocupada) {
            alert('Posição já ocupada. Remova antes.');
            return;
          }
          abrirModal(area, rua, i);
        };

        posDiv.appendChild(p);
      });

      ruaDiv.appendChild(posDiv);
      areaDiv.appendChild(ruaDiv);
    });

    mapa.appendChild(areaDiv);
  });

  if (typeof renderDashboard === 'function') renderDashboard();
};
