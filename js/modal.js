// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = null;

// -------------------------------
// ABRIR MODAL (CHAMADO PELO MAPA)
// -------------------------------
function abrirModal(areaIndex, ruaIndex, posicaoIndex) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const area = state.areas[areaIndex];
  const rua = area.ruas[ruaIndex];
  const posicao = rua.posicoes[posicaoIndex];

  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  // Preenche select de lotes
  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });

  // Se já ocupado, carrega dados
  if (posicao.ocupada) {
    select.value = posicao.lote;
    document.getElementById('modalRz').value = posicao.rz || '';
    document.getElementById('modalVolume').value = posicao.volume || '';
  } else {
    select.value = '';
    document.getElementById('modalRz').value = '';
    document.getElementById('modalVolume').value = '';
  }

  modal.classList.remove('hidden');
}

// -------------------------------
// FECHAR MODAL
// -------------------------------
function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
  modalContext = null;
}

// -------------------------------
// CONFIRMAR ENDEREÇAMENTO
// -------------------------------
function confirmarEndereco() {
  if (!modalContext) return;

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const loteNome = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!loteNome || !rz) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) {
    alert('Lote selecionado não existe');
    return;
  }

  // Verifica se o lote está cheio
  const usados = state.areas.reduce((acc, area) => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === loteNome) acc++;
      });
    });
    return acc;
  }, 0);

  if (!state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex].ocupada && usados >= lote.total) {
    alert(`Lote "${loteNome}" já atingiu sua capacidade máxima (${lote.total})`);
    return;
  }

  // Salva posição
  const posicao =
    state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  posicao.ocupada = true;
  posicao.lote = loteNome;
  posicao.rz = rz;
  posicao.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
}

// -------------------------------
// REMOVER GAYLORD
// -------------------------------
function removerGaylord() {
  if (!modalContext) return;

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  if (!confirm('Remover gaylord deste endereço?')) return;

  const posicao =
    state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  posicao.ocupada = false;
  posicao.lote = null;
  posicao.rz = null;
  posicao.volume = null;

  saveState();
  fecharModal();
  renderMapa();
}
