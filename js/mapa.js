// ===============================
// MAPA.JS — CONTROLE DO MAPA
// ===============================

// ---------- HELPERS ----------
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

// ---------- CRUD ÁREA ----------
window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  if (!input.value.trim()) return alert('Informe o nome da área');

  state.areas.push(criarArea(input.value.trim()));
  input.value = '';
  saveState();
  renderMapa();
};

window.excluirArea = function (id) {
  const area = state.areas.find(a => a.id === id);
  if (!area) return;

  if (area.ruas.some(r => r.posicoes.some(p => p.ocupada))) {
    return alert('Área possui gaylords alocadas');
  }

  if (!confirm('Excluir área?')) return;
  state.areas = state.areas.filter(a => a.id !== id);
  saveState();
  renderMapa();
};

// ---------- CRUD RUA ----------
window.adicionarRua = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de posições'));

  if (!nome || qtd <= 0) return alert('Dados inválidos');

  area.ruas.push(criarRua(nome, qtd));
  saveState();
  renderMapa();
};

window.excluirRua = function (areaId, ruaId) {
  const area = state.areas.find(a => a.id === areaId);
  const rua = area?.ruas.find(r => r.id === ruaId);
  if (!rua) return;

  if (rua.posicoes.some(p => p.ocupada)) {
    return alert('Rua possui gaylords alocadas');
  }

  if (!confirm('Excluir rua?')) return;
  area.ruas = area.ruas.filter(r => r.id !== ruaId);
  saveState();
  renderMapa();
};

// ---------- RENDER MAPA ----------
window.renderMapa = function () {
  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  mapa.innerHTML = '';

  state.areas.forEach((area, ai) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <button class="danger" onclick="excluirArea('${area.id}')">Excluir Área</button>
      </div>
    `;

    area.ruas.forEach((rua, ri) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          Rua ${rua.nome}
          <button class="danger"
            onclick="excluirRua('${area.id}','${rua.id}')">
            Excluir Rua
          </button>
        </div>
      `;

      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, pi) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        if (pos.ocupada) {
          p.classList.add('ocupada');
          const lote = state.lotes.find(l => l.nome === pos.lote);
          if (lote) p.style.background = lote.cor;
          p.title = `Lote: ${pos.lote}\nRZ: ${pos.rz}\nVol: ${pos.volume}`;
        }

        p.addEventListener('click', () => {
          abrirModal(ai, ri, pi);
        });

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
