// ===============================
// MODAL.JS — ENDEREÇAMENTO SEGURO
// ===============================

let modalContext = null;

// ===============================
// CONTADORES REAIS (MAPA + HISTÓRICO)
// ===============================
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          total++;
        }
      });
    });
  });

  return total;
};

window.contarExpedidasDoLote = function (nomeLote) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === nomeLote) {
      total += exp.quantidadeExpedida;
    }
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

  // 🔒 APENAS LOTES COM SALDO
  state.lotes.forEach(lote => {
    const expedidos = contarExpedidasDoLote(lote.nome);
    const alocados = contarGaylordsDoLote(lote.nome);
    const saldo = lote.total - (expedidos + alocados);

    if (saldo > 0) {
      const opt = document.createElement('option');
      opt.value = lote.nome;
      opt.textContent = `${lote.nome} (saldo ${saldo})`;
      select.appendChild(opt);
    }
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

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) {
    alert('Lote inválido');
    return;
  }

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  // 🚫 ENDEREÇO OCUPADO (OBRIGA REMOVER ANTES)
  if (posicao.ocupada && posicao.lote !== loteNome) {
    alert('Este endereço já está ocupado. Remova antes de alocar outro lote.');
    return;
  }

  const alocados = contarGaylordsDoLote(loteNome);
  const expedidos = contarExpedidasDoLote(loteNome);
  const totalPermitido = lote.total;

  const mesmaPosicaoMesmoLote =
    posicao.ocupada && posicao.lote === loteNome;

  // 🔒 REGRA FINAL — NÃO ULTRAPASSAR TOTAL
  if (
    alocados + expedidos >= totalPermitido &&
    !mesmaPosicaoMesmoLote
  ) {
    alert(
      `Não é possível alocar.\n\n` +
      `Lote: ${loteNome}\n` +
      `Total: ${totalPermitido}\n` +
      `Alocados: ${alocados}\n` +
      `Expedidos: ${expedidos}\n\n` +
      `👉 Para alocar mais, altere a quantidade do lote.`
    );
    return;
  }

  // ✅ ALOCAÇÃO SEGURA
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
