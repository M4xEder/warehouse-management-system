// ===============================
// MAPA.JS — CONTROLE DO ARMAZÉM
// ===============================

// ===============================
// HELPERS
// ===============================
function criarPosicao() {
  return { ocupada: false, lote: null, rz: null, volume: null };
}

function criarRua(nome, qtd) {
  return { id: crypto.randomUUID(), nome, posicoes: Array.from({ length: qtd }, criarPosicao) };
}

function criarArea(nome) {
  return { id: crypto.randomUUID(), nome, ruas: [] };
}

// ===============================
// CRUD ÁREA
// ===============================
window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  if (!input) return;
  const nome = input.value.trim();
  if (!nome) { alert('Informe o nome da área'); return; }

  state.areas.push(criarArea(nome));
  input.value = '';
  saveState();
  renderMapa();
};

window.excluirArea = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const possuiAlocacao = area.ruas.some(rua => rua.posicoes.some(p => p.ocupada));
  if (possuiAlocacao) { alert('Não é possível excluir a área. Existem gaylords alocadas.'); return; }
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

  const nome = prompt('Nome da rua'); if (!nome) return;
  const qtd = Number(prompt('Quantidade de posições')); if (!qtd || qtd <= 0) { alert('Quantidade inválida'); return; }

  area.ruas.push(criarRua(nome, qtd));
  saveState();
  renderMapa();
};

window.excluirRua = function (areaId, ruaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;
  const rua = area.ruas.find(r => r.id === ruaId);
  if (!rua) return;

  if (rua.posicoes.some(p => p.ocupada)) { alert('Não é possível excluir a rua. Existem gaylords alocadas.'); return; }
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

  state.areas.forEach((area, areaIndex) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';
    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <button class="danger" onclick="excluirArea('${area.id}')">Excluir Área</button>
      </div>
    `;

    area.ruas.forEach((rua, ruaIndex) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';
      ruaDiv.innerHTML = `
        <div class="rua-header">
          Rua ${rua.nome}
          <button class="danger" onclick="excluirRua('${area.id}','${rua.id}')">Excluir Rua</button>
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
          p.title = `Lote: ${posicao.lote}\nRZ: ${posicao.rz}\nVolume: ${posicao.volume || '-'}`;
        }
        if (posicao._highlight) p.classList.add('highlight');

        // O ponto chave: evento clicável para abrir modal
        p.addEventListener('click', () => {
          abrirModal(areaIndex, ruaIndex, posicaoIndex);
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

  if (typeof renderDashboard === 'function') renderDashboard();
};

// ===============================
// MODAL ENDEREÇAMENTO
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

  document.getElementById('modalVolume').value = pos.volume || '';
  document.getElementById('modalRz').value = pos.rz || '';
  loteSelect.value = pos.lote || (state.lotes.find(l => l.ativo)?.nome || '');

  window.modalContext = { areaIndex, ruaIndex, posIndex };
  document.getElementById('modal').classList.remove('hidden');
};

window.confirmarEndereco = function () {
  if (!window.modalContext) return;
  const { areaIndex, ruaIndex, posIndex } = window.modalContext;
  const pos = state.areas[areaIndex].ruas[ruaIndex].posicoes[posIndex];

  const lote = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!lote) { alert('Selecione um lote'); return; }
  if (!rz) { alert('Informe o RZ'); return; }

  pos.ocupada = true;
  pos.lote = lote;
  pos.rz = rz;
  pos.volume = volume;

  saveState();
  renderMapa();
  fecharModal();
};

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

window.fecharModal = function () {
  window.modalContext = null;
  document.getElementById('modal').classList.add('hidden');
};
