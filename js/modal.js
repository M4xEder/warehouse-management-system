// ===============================
// MODAL.JS — SUPABASE INTEGRADO PRO (VERSÃO CORRIGIDA FINAL)
// ===============================

let modalContext = {
  posicaoId: null
};

// --------------------------------------------------
// FUNÇÃO AUXILIAR — CALCULAR SALDO REAL DO LOTE
// --------------------------------------------------
function calcularSaldoLote(loteId) {

  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return 0;

  const total = Number(lote.quantidade ?? 0);

  const alocados = state.posicoes.filter(p =>
    p.ocupada === true &&
    p.lote_id === loteId
  ).length;

  const expedidos = state.historicoExpedidos
    ? state.historicoExpedidos.filter(h =>
        h.lote_id === loteId &&
        h.status === 'EXPEDIDO'
      ).length
    : 0;

  return total - alocados - expedidos;
}


// --------------------------------------------------
// ABRIR MODAL
// --------------------------------------------------
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

  // 🔥 Apenas lotes ativos com saldo calculado corretamente
  state.lotes
    .filter(l => l.status === 'ativo')
    .forEach(lote => {

      const saldo = calcularSaldoLote(lote.id);

      // Permite mostrar lote atual mesmo se saldo zerado
      if (saldo <= 0 && lote.id !== pos.lote_id) return;

      const opt = document.createElement('option');
      opt.value = lote.id;
      opt.textContent = `${lote.nome} (Saldo: ${saldo})`;
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


// --------------------------------------------------
// CONFIRMAR ENDEREÇAMENTO
// --------------------------------------------------
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

    const saldo = calcularSaldoLote(loteId);

    if (saldo <= 0) {
      alert('Lote sem saldo disponível');
      return;
    }

    // 🔥 Atualização local imediata
    atualizarPosicaoLocal(posicaoId, {
      lote_id: loteId,
      volume,
      rz,
      ocupada: true
    });

    // 🔥 Atualiza posição no banco
    const { error } = await dbAtualizarPosicao(posicaoId, {
      lote_id: loteId,
      volume,
      rz,
      ocupada: true
    });

    if (error) {
      alert('Erro ao salvar posição');
      return;
    }

    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }

    fecharModal();

  } catch (err) {
    console.error('Erro confirmarEndereco:', err);
  }
};


// --------------------------------------------------
// REMOVER GAYLORD
// --------------------------------------------------
window.removerGaylord = async function () {

  const { posicaoId } = modalContext;

  if (!confirm('Remover gaylord desta posição?')) return;

  try {

    const pos = state.posicoes.find(p => p.id === posicaoId);
    if (!pos) return;

    // 🔥 Atualização local
    atualizarPosicaoLocal(posicaoId, {
      lote_id: null,
      volume: null,
      rz: null,
      ocupada: false
    });

    // 🔥 Atualiza banco
    await dbLiberarPosicao(posicaoId);

    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }

    fecharModal();

  } catch (err) {
    console.error('Erro removerGaylord:', err);
  }
};


// --------------------------------------------------
// FECHAR MODAL
// --------------------------------------------------
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
};
