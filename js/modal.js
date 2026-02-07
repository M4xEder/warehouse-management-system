// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = null;

// ===============================
// CONTADOR REAL DO LOTE
// (MAPA É A VERDADE)
// ===============================
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada === true && pos.lote === nomeLote) {
          total++;
        }
      });
    });
  });

  return total;
};

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

  // ===============================
  // SOMENTE LOTES DISPONÍVEIS
  // ativo === true E saldo > 0
  // ===============================
  state.lotes
    .filter(lote => lote.ativo === true && lote.saldo > 0)
    .forEach(lote => {
      const opt = document.createElement('option');
      opt.value = lote.nome;
      opt.textContent =
        `${lote.nome} (${lote.saldo}/${lote.total})`;
      select.appendChild(opt);
    });

  // ===============================
  // SE POSIÇÃO JÁ OCUPADA
  // ===============================
  if (posicao.ocupada) {
    select.value = posicao.lote || '';
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
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
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
    l => l.nome === loteNome && l.ativo === true
  );

  if (!lote) {
    alert('Lote inválido ou indisponível');
    return;
  }

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  // ===============================
  // NÃO PERMITIR DUPLA ALOCAÇÃO
  // ===============================
  if (posicao.ocupada && posicao.lote !== loteNome) {
    alert('Endereço já ocupado. Remova primeiro.');
    return;
  }

  const usados = contarGaylordsDoLote(loteNome);

  const mesmaPosicaoMesmoLote =
    posicao.ocupada === true && posicao.lote === loteNome;

  // ===============================
  // REGRA DE SALDO
  // ===============================
  if (lote.saldo <= 0 && !mesmaPosicaoMesmoLote) {
    alert(`Lote "${loteNome}" não possui saldo disponível`);
    return;
  }

  // ===============================
  // ALOCAÇÃO LIMPA
  // ===============================
  posicao.ocupada = true;
  posicao.lote = loteNome;
  posicao.rz = rz;
  posicao.volume = volume || null;

  // Atualiza saldo do lote
  if (!mesmaPosicaoMesmoLote) {
    lote.saldo--;
  }

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

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  if (!confirm('Remover gaylord deste endereço?')) return;

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  if (posicao.ocupada && posicao.lote) {
    const lote = state.lotes.find(l => l.nome === posicao.lote);
    if (lote) lote.saldo++;
  }

  posicao.ocupada = false;
  posicao.lote = null;
  posicao.rz = null;
  posicao.volume = null;

  saveState();
  fecharModal();

  renderMapa();
  renderDashboard();
};
