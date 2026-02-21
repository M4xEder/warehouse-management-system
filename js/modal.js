// ===============================
// MODAL.JS — INTERFACE
// ===============================

let modalContext = {
  areaIndex: null,
  ruaIndex: null,
  posicaoIndex: null
};

// -------------------------------
window.abrirModal = function (areaIndex, ruaIndex, posicaoIndex) {

  if (!state?.areas?.[areaIndex]?.ruas?.[ruaIndex]?.posicoes?.[posicaoIndex]) {
    alert('Posição inválida');
    return;
  }

  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  const pos = state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  const modal = document.getElementById('modal');
  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  selectLote.innerHTML = '<option value="">Selecione um lote</option>';
  inputRz.value = '';
  inputVolume.value = '';

  state.lotes.forEach(lote => {

    const alocados = contarGaylordsDoLote(lote.nome);
    const expedidos = totalExpedidoDoLote(lote.nome);
    const saldo = lote.total - alocados - expedidos;

    if (pos.ocupada && lote.nome === pos.lote) {
      const opt = document.createElement('option');
      opt.value = lote.nome;
      opt.textContent = `${lote.nome} (saldo: ${saldo})`;
      selectLote.appendChild(opt);
      return;
    }

    if (saldo <= 0) return;

    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = `${lote.nome} (saldo: ${saldo})`;
    selectLote.appendChild(opt);
  });

  if (pos.ocupada) {

    selectLote.value = pos.lote;
    inputRz.value = pos.rz || '';
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

  if (rzJaExiste(rz, modalContext)) {
    alert('Este RZ já está alocado em outra posição');
    return;
  }

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) {
    alert('Lote inválido');
    return;
  }

  const alocados = contarGaylordsDoLote(loteNome);
  const expedidos = totalExpedidoDoLote(loteNome);
  const saldo = lote.total - alocados - expedidos;

  if (saldo <= 0) {
    alert('Este lote não possui saldo disponível');
    return;
  }

  const pos = state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  if (pos.ocupada) {
    alert('Remova a gaylord antes de alocar outra');
    return;
  }

  pos.ocupada = true;
  pos.lote = loteNome;
  pos.rz = rz;
  pos.volume = volume || null;
  pos.cor = lote.cor || '#999';
  pos.data = new Date().toLocaleDateString();
  pos.hora = new Date().toLocaleTimeString();

  saveState();
  fecharModal();
  renderMapa();
  renderDashboard();
};

// -------------------------------
window.removerGaylord = function () {

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  const pos = state.areas[areaIndex].ruas[ruaIndex].posicoes[posicaoIndex];

  if (!pos?.ocupada) {
    alert('Posição já está vazia');
    return;
  }

  if (!confirm('Remover gaylord desta posição?')) return;

  pos.ocupada = false;
  pos.lote = null;
  pos.rz = null;
  pos.volume = null;
  pos.cor = null;
  pos.data = null;
  pos.hora = null;

  saveState();
  fecharModal();
  renderMapa();
  renderDashboard();
};

// -------------------------------
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
};
