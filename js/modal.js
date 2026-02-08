// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = {
  areaIndex: null,
  ruaIndex: null,
  posicaoIndex: null
};

// -------------------------------
// ABRIR MODAL (GLOBAL)
// -------------------------------
window.abrirModal = function (areaIndex, ruaIndex, posicaoIndex) {
  const modal = document.getElementById('modal');
  if (!modal) {
    alert('Modal não encontrado no HTML');
    return;
  }

  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  const pos =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  // RESET
  selectLote.innerHTML = '<option value="">Selecione um lote</option>';
  inputRz.value = '';
  inputVolume.value = '';

  // POSIÇÃO OCUPADA
  if (pos.ocupada) {
    selectLote.innerHTML = `<option>${pos.lote}</option>`;
    inputRz.value = pos.rz;
    inputVolume.value = pos.volume || '';

    selectLote.disabled = true;
    inputRz.disabled = true;
  } else {
    // POSIÇÃO LIVRE → MOSTRAR LOTES ATIVOS COM SALDO
    state.lotes
      .filter(l => l.ativo !== false)
      .forEach(lote => {
        const alocados = contarGaylordsDoLote(lote.nome);
        const expedidos =
          state.historicoExpedidos
            .filter(e => e.lote === lote.nome)
            .reduce((s, e) => s + e.quantidadeExpedida, 0);

        const saldo = lote.total - alocados - expedidos;

        if (saldo > 0) {
          const opt = document.createElement('option');
          opt.value = lote.nome;
          opt.textContent = `${lote.nome} (saldo ${saldo})`;
          selectLote.appendChild(opt);
        }
      });

    selectLote.disabled = false;
    inputRz.disabled = false;
  }

  modal.classList.remove('hidden');
};

// -------------------------------
// CONFIRMAR ENDEREÇAMENTO
// -------------------------------
window.confirmarEndereco = function () {
  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const pos =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  if (pos.ocupada) {
    alert('Remova a gaylord antes de alterar');
    return;
  }

  const lote = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!lote || !rz) {
    alert('Lote e RZ são obrigatórios');
    return;
  }

  pos.ocupada = true;
  pos.lote = lote;
  pos.rz = rz;
  pos.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
};

// -------------------------------
// REMOVER GAYLORD
// -------------------------------
window.removerGaylord = function () {
  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const pos =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

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

  modalContext = {
    areaIndex: null,
    ruaIndex: null,
    posicaoIndex: null
  };
};
