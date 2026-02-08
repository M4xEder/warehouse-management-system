// ===============================
// MAPA.JS — CONTROLE DO ARMAZÉM
// ===============================

// ===============================
// HELPERS
// ===============================
function criarPosicao() {
  return {
    id: crypto.randomUUID(),
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
// ABRIR MODAL DE ENDEREÇAMENTO
// ===============================
window.abrirModal = function (areaId, ruaId, posicaoId) {
  const area = state.areas.find(a => a.id === areaId);
  const rua = area?.ruas.find(r => r.id === ruaId);
  const pos = rua?.posicoes.find(p => p.id === posicaoId);
  if (!pos) return;

  document.getElementById('modalLote').value = pos.lote || '';
  document.getElementById('modalVolume').value = pos.volume || '';
  document.getElementById('modalRz').value = pos.rz || '';

  window.modalContext = { areaId, ruaId, posicaoId };

  document.getElementById('modal').classList.remove('hidden');
};

// ===============================
// FECHAR MODAL
// ===============================
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
  window.modalContext = null;
};

// ===============================
// CONFIRMAR ENDEREÇO
// ===============================
window.confirmarEndereco = function () {
  if (!window.modalContext) return;
  const { areaId, ruaId, posicaoId } = window.modalContext;

  const area = state.areas.find(a => a.id === areaId);
  const rua = area.ruas.find(r => r.id === ruaId);
  const pos = rua.posicoes.find(p => p.id === posicaoId);

  pos.lote = document.getElementById('modalLote').value;
  pos.volume = document.getElementById('modalVolume').value;
  pos.rz = document.getElementById('modalRz').value;
  pos.ocupada = !!pos.lote;

  saveState();
  fecharModal();
  renderMapa();
};

// ===============================
// REMOVER POSIÇÃO
// ===============================
window.removerGaylord = function () {
  if (!window.modalContext) return;
  const { areaId, ruaId, posicaoId } = window.modalContext;

  const area = state.areas.find(a => a.id === areaId);
  const rua = area.ruas.find(r => r.id === ruaId);
  const pos = rua.posicoes.find(p => p.id === posicaoId);

  pos.lote = null;
  pos.rz = null;
  pos.volume = null;
  pos.ocupada = false;

  saveState();
  fecharModal();
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

      rua.posicoes.forEach(posicao => {
        const p = document.createElement('div');
        p.className = 'posicao';
        if (posicao.ocupada) {
          p.classList.add('ocupada');
          const loteObj = state.lotes.find(l => l.nome === posicao.lote);
          if (loteObj) p.style.background = loteObj.cor;
          p.title = `Lote: ${posicao.lote}\nRZ: ${posicao.rz}\nVol: ${posicao.volume || '-'}`;
        }

        p.onclick = () => abrirModal(area.id, rua.id, posicao.id);
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
// ===============================
// ABRIR MODAL DE ENDEREÇAMENTO
// ===============================
window.abrirModal = function (areaIndex, ruaIndex, posIndex) {
  const area = state.areas[areaIndex];
  const rua = area.ruas[ruaIndex];
  const pos = rua.posicoes[posIndex];

  if (!area || !rua || !pos) return;

  // Preencher select de lotes ativos
  const loteSelect = document.getElementById('modalLote');
  loteSelect.innerHTML = '';
  state.lotes.filter(l => l.ativo).forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.nome;
    opt.textContent = l.nome;
    loteSelect.appendChild(opt);
  });

  // Preencher valores atuais se já existir
  document.getElementById('modalVolume').value = pos.volume || '';
  document.getElementById('modalRz').value = pos.rz || '';
  loteSelect.value = pos.lote || (state.lotes.find(l => l.ativo)?.nome || '');

  // Guardar posição para salvar
  window.modalContext = { areaIndex, ruaIndex, posIndex };

  document.getElementById('modal').classList.remove('hidden');
};

// ===============================
// CONFIRMAR ENDEREÇO
// ===============================
window.confirmarEndereco = function () {
  if (!window.modalContext) return;

  const { areaIndex, ruaIndex, posIndex } = window.modalContext;
  const area = state.areas[areaIndex];
  const rua = area.ruas[ruaIndex];
  const pos = rua.posicoes[posIndex];

  const lote = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!lote) { alert('Selecione um lote'); return; }
  if (!rz) { alert('Informe o RZ'); return; }

  // Salvar informações
  pos.ocupada = true;
  pos.lote = lote;
  pos.rz = rz;
  pos.volume = volume;

  saveState();
  renderMapa();
  fecharModal();
};

// ===============================
// REMOVER GAYLORD
// ===============================
window.removerGaylord = function () {
  if (!window.modalContext) return;

  const { areaIndex, ruaIndex, posIndex } = window.modalContext;
  const pos = state.areas[areaIndex].ruas[ruaIndex].posicoes[posIndex];

  pos.ocupada = false;
  pos.lote = null;
  pos.rz = null;
  pos.volume = null;

  saveState();
  renderMapa();
  fecharModal();
};

// ===============================
// FECHAR MODAL
// ===============================
window.fecharModal = function () {
  window.modalContext = null;
  document.getElementById('modal').classList.add('hidden');
};
