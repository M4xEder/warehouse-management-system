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
    alert('Não é possível excluir a área. Existem gaylords alocadas.');
    return;
  }

  if (!confirm('Deseja excluir esta área?')) return;

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
    alert('Não é possível excluir a rua. Existem gaylords alocadas.');
    return;
  }

  if (!confirm('Deseja excluir esta rua?')) return;

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
      <div class="area-header">
        <strong>${area.nome}</strong>
        <button class="danger" onclick="excluirArea('${area.id}')">
          Excluir Área
        </button>
      </div>
    `;

    area.ruas.forEach(rua => {
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

      rua.posicoes.forEach((posicao, posicaoIndex) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        // ----------------------------
        // POSIÇÃO OCUPADA
        // ----------------------------
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

        // ----------------------------
        // DESTAQUE DA BUSCA
        // ----------------------------
        if (posicao._highlight) {
          p.classList.add('highlight');
        } else {
          p.classList.remove('highlight');
        }

        // ----------------------------
        // CLICK → MODAL
        // ----------------------------
        p.onclick = () => {
          const areaIndex = state.areas.findIndex(a => a.id === area.id);
          const ruaIndex = area.ruas.findIndex(r => r.id === rua.id);

          abrirModal(areaIndex, ruaIndex, posicaoIndex);
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

  // Mantém dashboard sincronizado
  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
};
