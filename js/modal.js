// ===============================
// MODAL.JS — ENDEREÇAMENTO ESTÁVEL
// ===============================

let modalContext = null;

// ===============================
// ABRIR MODAL
// ===============================
window.abrirModal = function (areaIndex, ruaIndex, posicaoIndex) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione</option>';

  // Apenas lotes ativos
  state.lotes
    .filter(l => l.ativo !== false)
    .forEach(lote => {
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
};

// ===============================
// FECHAR MODAL
// ===============================
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
  modalContext = null;
};

// ===============================
// CONFIRMAR ENDEREÇAMENTO
// ===============================
window.confirmarEndereco = function () {
  if (!modalContext) return;

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const loteNome = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!loteNome || !rz) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

  const lote = state.lotes.find(
    l => l.nome === loteNome && l.ativo !== false
  );

  if (!lote) {
    alert('Lote inválido ou finalizado');
    return;
  }

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  const usados = contarGaylordsDoLote(loteNome);

  const mesmaPosicaoMesmoLote =
    posicao.ocupada && posicao.lote === loteNome;

  if (usados >= lote.total && !mesmaPosicaoMesmoLote) {
    alert(`Lote "${loteNome}" está cheio (${usados}/${lote.total})`);
    return;
  }

  posicao.ocupada = true;
  posicao.lote = loteNome;
  posicao.rz = rz;
  posicao.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
  renderDashboard();
};

// ===============================
// REMOVER GAYLORD
// ===============================
window.removerGaylord = function () {
  if (!modalContext) return;

  if (!confirm('Remover gaylord deste endereço?')) return;

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  posicao.ocupada = false;
  posicao.lote = null;
  posicao.rz = null;
  posicao.volume = null;

  saveState();
  fecharModal();
  renderMapa();
  renderDashboard();
};
