// ==================================
// MODAL.JS — ENDEREÇAMENTO
// ==================================

let contextoModal = null;

/*
 contextoModal = {
   area,
   rua,
   posicao,
   index
 }
*/

// ===============================
// ABRIR MODAL
// ===============================
window.abrirModal = function (ctx) {
  contextoModal = ctx;

  const modal = document.getElementById('modal');
  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  if (!modal || !selectLote || !inputRz || !inputVolume) {
    console.error('Modal: elementos não encontrados');
    return;
  }

  // popula lotes
  selectLote.innerHTML = '<option value="">Selecione o lote</option>';
  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    selectLote.appendChild(opt);
  });

  const pos = ctx.posicao;

  // se já ocupado
  if (pos.ocupada) {
    selectLote.value = pos.lote;
    inputRz.value = pos.rz || '';
    inputVolume.value = pos.volume || '';
  } else {
    selectLote.value = '';
    inputRz.value = '';
    inputVolume.value = '';
  }

  modal.classList.remove('hidden');
};

// ===============================
// FECHAR MODAL
// ===============================
window.fecharModal = function () {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  contextoModal = null;
};

// ===============================
// CONFIRMAR ENDEREÇAMENTO
// ===============================
window.confirmarEndereco = function () {
  if (!contextoModal) return;

  const selectLote = document.getElementById('modalLote');
  const inputRz = document.getElementById('modalRz');
  const inputVolume = document.getElementById('modalVolume');

  const loteNome = selectLote.value;
  const rz = inputRz.value.trim();
  const volume = inputVolume.value.trim();

  if (!loteNome) return alert('Selecione um lote');
  if (!rz) return alert('RZ é obrigatório');

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return alert('Lote não encontrado');

  const pos = contextoModal.posicao;

  // se estava vazio, incrementa
  if (!pos.ocupada) {
    if (lote.usados >= lote.total) {
      return alert(`Lote "${lote.nome}" já está completo`);
    }
    lote.usados++;
  }

  pos.ocupada = true;
  pos.lote = loteNome;
  pos.rz = rz;
  pos.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
};

// ===============================
// REMOVER GAYLORD
// ===============================
window.removerGaylord = function () {
  if (!contextoModal) return;

  const pos = contextoModal.posicao;
  if (!pos.ocupada) return alert('Posição vazia');

  if (!confirm('Remover gaylord desta posição?')) return;

  const lote = state.lotes.find(l => l.nome === pos.lote);
  if (lote && lote.usados > 0) {
    lote.usados--;
  }

  pos.ocupada = false;
  pos.lote = null;
  pos.rz = null;
  pos.volume = null;

  saveState();
  fecharModal();
  renderMapa();
};
