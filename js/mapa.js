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
// ABRIR MODAL ENDEREÇAMENTO
// ===============================
window.abrirModal = function (areaId, ruaId, posIndex) {
  const area = state.areas.find(a => a.id === areaId);
  const rua = area.ruas.find(r => r.id === ruaId);
  const pos = rua.posicoes[posIndex];

  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');

  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">-- Selecione o Lote --</option>'; // sempre vazio
  select.disabled = false;

  const rzInput = document.getElementById('modalRz');
  const volumeInput = document.getElementById('modalVolume');

  // Posição ocupada: mostra dados, não permite alterar lote nem RZ
  if (pos.ocupada) {
    const loteAtual = state.lotes.find(l => l.nome === pos.lote);
    const opt = document.createElement('option');
    opt.value = loteAtual.nome;
    opt.textContent = loteAtual.nome;
    opt.selected = true;
    select.appendChild(opt);
    select.disabled = true;
    rzInput.value = pos.rz || '';
    rzInput.disabled = true;
    volumeInput.value = pos.volume || '';
  } else {
    // posição vazia: lote e RZ obrigatórios
    const lotesDisponiveis = state.lotes.filter(
      l => l.ativo !== false && calcularSaldoLote(l.nome) > 0
    );

    if (lotesDisponiveis.length === 0) {
      alert('Nenhum lote disponível para alocação');
      modal.classList.add('hidden');
      return;
    }

    lotesDisponiveis.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.nome;
      opt.textContent = l.nome;
      select.appendChild(opt);
    });

    rzInput.value = '';
    rzInput.disabled = false;
    volumeInput.value = '';
  }

  modal.dataset.area = areaId;
  modal.dataset.rua = ruaId;
  modal.dataset.pos = posIndex;
};

// ===============================
// SALVAR ENDEREÇO
// ===============================
window.confirmarEndereco = function () {
  const modal = document.getElementById('modal');
  const areaId = modal.dataset.area;
  const ruaId = modal.dataset.rua;
  const posIndex = Number(modal.dataset.pos);

  const area = state.areas.find(a => a.id === areaId);
  const rua = area.ruas.find(r => r.id === ruaId);
  const pos = rua.posicoes[posIndex];

  const loteNome = document.getElementById('modalLote').value.trim();
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  // validação RZ obrigatória e lote
  if (!rz) {
    alert('RZ é obrigatório');
    return;
  }
  if (!loteNome) {
    alert('Selecione um lote');
    return;
  }

  // validação posição ocupada
  if (pos.ocupada) {
    alert('Esta posição já está ocupada. Remova antes de alocar outro lote.');
    return;
  }

  pos.ocupada = true;
  pos.lote = loteNome;
  pos.rz = rz;
  pos.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
};

// ===============================
// REMOVER GAYLORD
// ===============================
window.removerGaylord = function () {
  const modal = document.getElementById('modal');
  const areaId = modal.dataset.area;
  const ruaId = modal.dataset.rua;
  const posIndex = Number(modal.dataset.pos);

  const area = state.areas.find(a => a.id === areaId);
  const rua = area.ruas.find(r => r.id === ruaId);
  const pos = rua.posicoes[posIndex];

  if (!pos.ocupada) return;

  pos.ocupada = false;
  pos.lote = null;
  pos.rz = null;
  pos.volume = null;

  saveState();
  fecharModal();
  renderMapa();
};

// ===============================
// FECHAR MODAL
// ===============================
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
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

        if (posicao.ocupada) {
          p.classList.add('ocupada');
          const lote = state.lotes.find(l => l.nome === posicao.lote);
          if (lote) p.style.background = lote.cor;

          p.title =
            `Lote: ${posicao.lote}\nRZ: ${posicao.rz}\nVolume: ${posicao.volume || '-'}`;
        }

        if (posicao._highlight) p.classList.add('highlight');
        else p.classList.remove('highlight');

        p.onclick = () => abrirModal(area.id, rua.id, posicaoIndex);
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

  if (typeof renderDashboard === 'function') renderDashboard();
};
