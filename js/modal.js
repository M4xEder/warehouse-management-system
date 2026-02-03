// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = null;

// ABRIR MODAL
function abrirModal(areaIndex, ruaIndex, posIndex) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const area = state.areas[areaIndex];
  const rua = area.ruas[ruaIndex];
  const posicao = rua.posicoes[posIndex];

  modalContext = { areaIndex, ruaIndex, posIndex };

  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });

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

// FECHAR MODAL
function fecharModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modalContext = null;
}

// CONFIRMAR ENDEREÇAMENTO
function confirmarEndereco() {
  if (!modalContext) return;

  const { areaIndex, ruaIndex, posIndex } = modalContext;

  const lote = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!lote || !rz) return alert('Lote e RZ são obrigatórios');

  const posicao = state.areas[areaIndex].ruas[ruaIndex].posicoes[posIndex];

  // Verifica se lote está cheio
  const loteInfo = state.lotes.find(l => l.nome === lote);
  const usados = state.areas.reduce((acc, a) => {
    a.ruas.forEach(r => r.posicoes.forEach(p => {
      if (p.lote === lote) acc++;
    }));
    return acc;
  }, 0);

  if (loteInfo && usados >= loteInfo.total && posicao.lote !== lote) {
    return alert(`Lote "${lote}" já está cheio`);
  }

  posicao.ocupada = true;
  posicao.lote = lote;
  posicao.rz = rz;
  posicao.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
}

// REMOVER GAYLORD
function removerGaylord() {
  if (!modalContext) return;

  const { areaIndex, ruaIndex, posIndex } = modalContext;

  if (!confirm('Remover gaylord deste endereço?')) return;

  const posicao = state.areas[areaIndex].ruas[ruaIndex].posicoes[posIndex];

  posicao.ocupada = false;
  posicao.lote = null;
  posicao.rz = null;
  posicao.volume = null;

  saveState();
  fecharModal();
  renderMapa();
}
