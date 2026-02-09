// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = {
  areaIndex: null,
  ruaIndex: null,
  posicaoIndex: null
};

// -------------------------------
// ABRIR MODAL
// -------------------------------
window.abrirModal = function (areaIndex, ruaIndex, posicaoIndex) {
  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  const pos =
    state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  const modal = document.getElementById('modal');
  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  // limpa campos
  selectLote.innerHTML = '<option value="">Selecione um lote</option>';
  inputRz.value = '';
  inputVolume.value = '';

  // popula lotes ativos
  state.lotes
    .filter(l => l.ativo !== false)
    .forEach(lote => {
      const opt = document.createElement('option');
      opt.value = lote.nome;
      opt.textContent = lote.nome;
      selectLote.appendChild(opt);
    });

  // POSIÇÃO OCUPADA → SOMENTE VISUALIZAÇÃO / REMOÇÃO
  if (pos.ocupada) {
    selectLote.value = pos.lote;
    inputRz.value = pos.rz;
    inputVolume.value = pos.volume || '';

    selectLote.disabled = true;
    inputRz.disabled = true;
    inputVolume.disabled = true;
  } else {
    selectLote.disabled = false;
    inputRz.disabled = false;
    inputVolume.disabled = false;
  }

  modal.classList.remove('hidden');
};

// -------------------------------
// CONFIRMAR ENDEREÇO
// -------------------------------
window.confirmarEndereco = function () {
  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  const loteNome = selectLote.value;
  const rz = inputRz.value.trim();
  const volume = inputVolume.value.trim();

  if (!loteNome) {
    alert('Selecione um lote');
    return;
  }

  if (!rz) {
    alert('RZ é obrigatório');
    return;
  }

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote || lote.ativo === false) {
    alert('Lote inválido ou já finalizado');
    return;
  }

  const alocados = contarGaylordsDoLote(loteNome);
  if (alocados >= lote.total) {
    alert('Não é possível alocar mais que o total do lote');
    return;
  }

  const pos =
    state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  if (pos.ocupada) {
    alert('Remova a gaylord antes de alocar outra');
    return;
  }

  pos.ocupada = true;
  pos.lote = loteNome;
  pos.rz = rz;
  pos.volume = volume || null;

  saveState();
  renderMapa();
  renderDashboard();
  fecharModal();
};

// -------------------------------
// REMOVER GAYLORD
// -------------------------------
window.removerGaylord = function () {
  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;
  const pos =
    state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  if (!pos.ocupada) {
    alert('Posição já está vazia');
    return;
  }

  if (!confirm('Remover gaylord desta posição?')) return;

  pos.ocupada = false;
  pos.lote = null;
  pos.rz = null;
  pos.volume = null;

  saveState();
  fecharModal();
  renderMapa();
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
};
