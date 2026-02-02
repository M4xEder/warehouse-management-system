let posicaoSelecionada = null;

window.abrirModal = function (posicao) {
  posicaoSelecionada = posicao;

  document.getElementById('modal').classList.remove('hidden');

  // popular lotes
  const select = document.getElementById('modalLote');
  select.innerHTML = '';
  state.lotes.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.nome;
    opt.textContent = l.nome;
    select.appendChild(opt);
  });

  // se já tiver dados
  if (posicao.ocupada) {
    select.value = posicao.lote;
    document.getElementById('modalRz').value = posicao.rz || '';
    document.getElementById('modalVolume').value = posicao.volume || '';
  } else {
    document.getElementById('modalRz').value = '';
    document.getElementById('modalVolume').value = '';
  }
};

window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
  posicaoSelecionada = null;
};

window.confirmarEndereco = function () {
  if (!posicaoSelecionada) return;

  const loteNome = document.getElementById('modalLote').value;
  const rz = document.getElementById('modalRz').value.trim();

  if (!rz) return alert('RZ é obrigatório');

  const volume = document.getElementById('modalVolume').value.trim();

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return alert('Lote inválido');

  // se estava vazio, incrementa lote
  if (!posicaoSelecionada.ocupada) {
    lote.usados++;
  }

  posicaoSelecionada.ocupada = true;
  posicaoSelecionada.lote = loteNome;
  posicaoSelecionada.rz = rz;
  posicaoSelecionada.volume = volume;

  saveState();
  fecharModal();
  renderMapa();
  renderDashboard();
};

window.removerGaylord = function () {
  if (!posicaoSelecionada || !posicaoSelecionada.ocupada) return;

  const lote = state.lotes.find(l => l.nome === posicaoSelecionada.lote);
  if (lote && lote.usados > 0) {
    lote.usados--;
  }

  posicaoSelecionada.ocupada = false;
  delete posicaoSelecionada.lote;
  delete posicaoSelecionada.rz;
  delete posicaoSelecionada.volume;

  saveState();
  fecharModal();
  renderMapa();
  renderDashboard();
};
