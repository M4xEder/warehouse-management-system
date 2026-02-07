// ===============================
// MAPA.JS — CONTROLE DO ARMAZÉM
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
// CADASTRAR ÁREA
// -------------------------------
window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  if (!input) return;

  const nome = input.value.trim();
  if (!nome) return alert('Informe o nome da área');

  state.areas.push(criarArea(nome));
  input.value = '';

  saveState();
  renderMapa();
};

// -------------------------------
// ADICIONAR RUA
// -------------------------------
window.adicionarRua = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  if (!Array.isArray(area.ruas)) area.ruas = [];

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de posições'));
  if (!qtd || qtd <= 0) return alert('Quantidade inválida');

  area.ruas.push(criarRua(nome, qtd));
  saveState();
  renderMapa();
};

// -------------------------------
// RENDER MAPA
// -------------------------------
window.renderMapa = function () {
  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  mapa.innerHTML = '';

  state.areas.forEach(area => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <strong>${area.nome}</strong>
      <button onclick="adicionarRua('${area.id}')">Adicionar Rua</button>
    `;

    area.ruas.forEach(rua => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';
      ruaDiv.innerHTML = `<strong>Rua ${rua.nome}</strong>`;

      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, pIndex) => {
        const div = document.createElement('div');
        div.className = 'posicao';

        if (pos.ocupada) {
          div.classList.add('ocupada');
          const lote = state.lotes.find(l => l.nome === pos.lote);
          if (lote) div.style.background = lote.cor;
        }

        div.onclick = () => abrirModal(
          state.areas.indexOf(area),
          area.ruas.indexOf(rua),
          pIndex
        );

        posicoesDiv.appendChild(div);
      });

      ruaDiv.appendChild(posicoesDiv);
      areaDiv.appendChild(ruaDiv);
    });

    mapa.appendChild(areaDiv);
  });
};
