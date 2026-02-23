// ===============================
// MODAL.JS — SUPABASE INTEGRADO PRO
// ===============================

let modalContext = {
  posicaoId: null
};

// -------------------------------
window.abrirModalPorId = function (posicaoId) {

  const pos = state.posicoes.find(p => p.id === posicaoId);

  if (!pos) {
    alert('Posição não encontrada');
    return;
  }

  modalContext = { posicaoId };

  const modal = document.getElementById('modal');
  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  selectLote.innerHTML = '<option value="">Selecione um lote</option>';

  // 🔥 Apenas lotes ativos com saldo
  state.lotes
    .filter(l => l.status === 'ativo')
    .forEach(lote => {

      if (lote.quantidade <= 0 && lote.id !== pos.lote_id) return;

      const opt = document.createElement('option');
      opt.value = lote.id;
      opt.textContent = `${lote.nome} (saldo: ${lote.quantidade})`;
      selectLote.appendChild(opt);
    });

  inputRz.value = pos.rz || '';
  inputVolume.value = pos.volume || '';

  if (pos.ocupada) {
    selectLote.value = pos.lote_id || '';
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
window.confirmarEndereco = async function () {

  const { posicaoId } = modalContext;

  const loteId = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();
  const volume = document.getElementById('modalVolume').value.trim();

  if (!loteId) {
    alert('Selecione um lote');
    return;
  }

  if (!rz) {
    alert('RZ é obrigatório');
    return;
  }

  try {

    const lote = state.lotes.find(l => l.id === loteId);

    if (!lote || lote.quantidade <= 0) {
      alert('Lote sem saldo disponível');
      return;
    }

    // 🔥 1. Atualização otimista imediata (visual instantâneo)
    atualizarPosicaoLocal(posicaoId, {
      lote_id: loteId,
      volume,
      rz,
      ocupada: true
    });

    // 🔥 2. Atualiza posição no banco
    const { error: erroPos } = await dbAtualizarPosicao(posicaoId, {
      lote_id: loteId,
      volume,
      rz,
      ocupada: true
    });

    if (erroPos) {
      alert('Erro ao salvar posição');
      return;
    }

    // 🔥 3. Atualiza lote no banco
    const { data: loteAtualizado, error: erroLote } =
      await dbAtualizarLote(loteId, {
        quantidade: lote.quantidade - 1
      });

    if (erroLote) {
      alert('Erro ao atualizar lote');
      return;
    }

    // 🔥 4. Atualização otimista do lote
    const index = state.lotes.findIndex(l => l.id === loteId);
    if (index !== -1) {
      state.lotes[index] = loteAtualizado;
    }

    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }

    fecharModal();

  } catch (err) {
    console.error('Erro confirmarEndereco:', err);
  }
};


// -------------------------------
window.removerGaylord = async function () {

  const { posicaoId } = modalContext;

  if (!confirm('Remover gaylord desta posição?')) return;

  try {

    const pos = state.posicoes.find(p => p.id === posicaoId);
    if (!pos || !pos.lote_id) return;

    const loteId = pos.lote_id;
    const lote = state.lotes.find(l => l.id === loteId);

    // 🔥 1. Atualização visual imediata
    atualizarPosicaoLocal(posicaoId, {
      lote_id: null,
      volume: null,
      rz: null,
      ocupada: false
    });

    // 🔥 2. Banco posição
    await dbLiberarPosicao(posicaoId);

    // 🔥 3. Devolve saldo ao lote
    if (lote) {

      const { data: loteAtualizado } =
        await dbAtualizarLote(loteId, {
          quantidade: lote.quantidade + 1
        });

      const index = state.lotes.findIndex(l => l.id === loteId);
      if (index !== -1) {
        state.lotes[index] = loteAtualizado;
      }
    }

    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }

    fecharModal();

  } catch (err) {
    console.error('Erro removerGaylord:', err);
  }
};


// -------------------------------
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
};
