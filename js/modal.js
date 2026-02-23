// ===============================
// MODAL.JS — SUPABASE INTEGRADO
// ===============================

let modalContext = {
  posicaoId: null,
  areaIndex: null,
  ruaIndex: null,
  posicaoIndex: null
};

// -------------------------------
window.abrirModal = function (areaIndex, ruaIndex, posicaoIndex) {

  const pos = state?.areas?.[areaIndex]?.ruas?.[ruaIndex]?.posicoes?.[posicaoIndex];

  if (!pos) {
    alert('Posição inválida');
    return;
  }

  modalContext = {
    posicaoId: pos.id,
    areaIndex,
    ruaIndex,
    posicaoIndex
  };

  const modal = document.getElementById('modal');
  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  selectLote.innerHTML = '<option value="">Selecione um lote</option>';
  inputRz.value = pos.rz || '';
  inputVolume.value = pos.volume || '';

  state.lotes.forEach(lote => {

    if (lote.quantidade <= 0 && lote.id !== pos.lote_id) return;

    const opt = document.createElement('option');
    opt.value = lote.id;
    opt.textContent = `${lote.nome} (saldo: ${lote.quantidade})`;
    selectLote.appendChild(opt);
  });

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

    // Buscar lote atual
    const lote = state.lotes.find(l => l.id === loteId);

    if (!lote || lote.quantidade <= 0) {
      alert('Este lote não possui saldo disponível');
      return;
    }

    // Atualizar posição
    const { error: erroPos } = await window.supabaseClient
      .from('posicoes')
      .update({
        lote_id: loteId,
        volume,
        rz,
        ocupada: true
      })
      .eq('id', posicaoId);

    if (erroPos) {
      console.error(erroPos);
      alert('Erro ao salvar posição');
      return;
    }

    // Diminuir quantidade do lote
    await window.supabaseClient
      .from('lotes')
      .update({
        quantidade: lote.quantidade - 1
      })
      .eq('id', loteId);

    await carregarLotesDoBanco();

    if (typeof carregarMapaDoBanco === 'function') {
      await carregarMapaDoBanco();
    }

    fecharModal();
    renderMapa();
    renderDashboard();

  } catch (err) {
    console.error('Erro geral confirmarEndereco:', err);
  }
};

// -------------------------------
window.removerGaylord = async function () {

  const { posicaoId } = modalContext;

  if (!confirm('Remover gaylord desta posição?')) return;

  try {

    // Buscar posição atual
    const { data } = await window.supabaseClient
      .from('posicoes')
      .select('lote_id')
      .eq('id', posicaoId)
      .single();

    const loteId = data?.lote_id;

    // Limpar posição
    await window.supabaseClient
      .from('posicoes')
      .update({
        lote_id: null,
        volume: null,
        rz: null,
        ocupada: false
      })
      .eq('id', posicaoId);

    // Devolver quantidade ao lote
    if (loteId) {
      const lote = state.lotes.find(l => l.id === loteId);

      if (lote) {
        await window.supabaseClient
          .from('lotes')
          .update({
            quantidade: lote.quantidade + 1
          })
          .eq('id', loteId);
      }
    }

    await carregarLotesDoBanco();

    if (typeof carregarMapaDoBanco === 'function') {
      await carregarMapaDoBanco();
    }

    fecharModal();
    renderMapa();
    renderDashboard();

  } catch (err) {
    console.error('Erro geral removerGaylord:', err);
  }
};

// -------------------------------
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
};

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

  state.lotes.forEach(lote => {

    if (lote.quantidade <= 0 && lote.id !== pos.lote_id) return;

    const opt = document.createElement('option');
    opt.value = lote.id;
    opt.textContent = `${lote.nome} (saldo: ${lote.quantidade})`;
    selectLote.appendChild(opt);
  });

  if (pos.ocupada) {
    selectLote.value = pos.lote_id || '';
    inputRz.value = pos.rz || '';
    inputVolume.value = pos.volume || '';

    selectLote.disabled = true;
    inputRz.disabled = true;
    inputVolume.disabled = true;
  } else {
    inputRz.value = '';
    inputVolume.value = '';

    selectLote.disabled = false;
    inputRz.disabled = false;
    inputVolume.disabled = false;
  }

  modal.classList.remove('hidden');
};
