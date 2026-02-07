// ===============================
// MAPA.JS — CONTROLE DO ARMAZÉM
// ===============================

// -------------------------------
// HELPERS
// -------------------------------
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
// ÁREA
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

window.excluirArea = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const ocupada = area.ruas.some(r =>
    r.posicoes.some(p => p.ocupada)
  );

  if (ocupada) {
    alert('Existem gaylords alocadas');
    return;
  }

  if (!confirm('Excluir área?')) return;

  state.areas = state.areas.filter(a => a.id !== areaId);
  saveState();
  renderMapa();
};

// -------------------------------
// RUA
// -------------------------------
window.adicionarRua = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de posições'));
  if (!qtd || qtd <= 0) return alert('Quantidade inválida');

  area.ruas.push(criarRua(nome, qtd));
  saveState();
  renderMapa();
};

window.excluirRua = function (areaId, ruaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const rua = area.ruas.find(r => r.id === ruaId);
  if (!rua) return;

  if (rua.posicoes.some(p => p.ocupada)) {
    alert('Existem gaylords alocadas');
    return;
  }

  if (!confirm('Excluir rua?')) return;

  area.ruas = area.ruas.filter(r => r.id !== ruaId);
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
      <button onclick="excluirArea('${area.id}')">Excluir Área</button>
    `;

    area.ruas.forEach(rua => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        Rua ${rua.nome}
        <button onclick="excluirRua('${area.id}','${rua.id}')">Excluir Rua</button>
      `;

      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, i) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        if (pos.ocupada) {
          p.classList.add('ocupada');
          const lote = state.lotes.find(l => l.nome === pos.lote);
          if (lote) p.style.background = lote.cor;
        }

        p.onclick = () => {
          const a = state.areas.findIndex(x => x.id === area.id);
          const r = area.ruas.findIndex(x => x.id === rua.id);
          abrirModal(a, r, i);
        };

        posicoesDiv.appendChild(p);
      });

      ruaDiv.appendChild(posicoesDiv);
      areaDiv.appendChild(ruaDiv);
    });

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => adicionarRua(area.id);

    areaDiv.appendChild(btnRua);
    mapa.appendChild(areaDiv);
  });
};
