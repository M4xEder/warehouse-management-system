// ===============================
// MAPA.JS — CONTROLE DO ARMAZÉM
// ===============================

// ===============================
// HELPERS
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

// ===============================
// CRUD ÁREA
// ===============================
window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  if (!input) return;

  const nome = input.value.trim();
  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  state.areas.push(criarArea(nome));
  input.value = '';
  saveState();
  renderMapa();
};

window.excluirArea = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const possuiAlocacao = area.ruas.some(rua =>
    rua.posicoes.some(p => p.ocupada)
  );

  if (possuiAlocacao) {
    alert('Não é possível excluir. Existem gaylords alocadas.');
    return;
  }

  if (!confirm('Excluir área?')) return;

  state.areas = state.areas.filter(a => a.id !== areaId);
  saveState();
  renderMapa();
};

// ===============================
// CRUD RUA
// ===============================
window.adicionarRua = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de posições'));
  if (!qtd || qtd <= 0) {
    alert('Quantidade inválida');
    return;
  }

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
    alert('Não é possível excluir. Existem gaylords alocadas.');
    return;
  }

  if (!confirm('Excluir rua?')) return;

  area.ruas = area.ruas.filter(r => r.id !== ruaId);
  saveState();
  renderMapa();
};

// ===============================
// RENDER MAPA
// ===============================
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

      rua.posicoes.forEach((posicao, posicaoIndex) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        // DATASET PARA BUSCA
        p.dataset.rz = posicao.rz || '';
        p.dataset.lote = posicao.lote || '';

        // POSIÇÃO OCUPADA
        if (posicao.ocupada) {
          p.classList.add('ocupada');

          const lote = state.lotes.find(l => l.nome === posicao.lote);
          if (lote) {
            p.style.background = lote.cor;
          }

          p.title =
            `Lote: ${posicao.lote}\n` +
            `RZ: ${posicao.rz}\n` +
            `Volume: ${posicao.volume || '-'}`;
        }

        // CLICK → MODAL
        p.onclick = () => {
          abrirModal(
            state.areas.findIndex(a => a.id === area.id),
            area.ruas.findIndex(r => r.id === rua.id),
            posicaoIndex
          );
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

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
};

// ===============================
// BUSCA (RZ OU LOTE)
// ===============================
window.buscarEndereco = function () {
  const termo = document
    .getElementById('buscaInput')
    .value
    .trim()
    .toLowerCase();

  document.querySelectorAll('.posicao').forEach(pos => {
    const rz = pos.dataset.rz.toLowerCase();
    const lote = pos.dataset.lote.toLowerCase();

    if (!termo) {
      pos.classList.remove('oculto');
      return;
    }

    if (rz.includes(termo) || lote.includes(termo)) {
      pos.classList.remove('oculto');
    } else {
      pos.classList.add('oculto');
    }
  });
};

window.limparBusca = function () {
  document.getElementById('buscaInput').value = '';
  buscarEndereco();
};
