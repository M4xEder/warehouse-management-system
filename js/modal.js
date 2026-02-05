// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = null;

// -------------------------------
// CONTADOR REAL DE LOTE (MAPA = VERDADE)
// -------------------------------
function contarGaylordsDoLote(nomeLote) {
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
}

// -------------------------------
// ABRIR MODAL
// -------------------------------
function abrirModal(areaIndex, ruaIndex, posicaoIndex) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });

  if (posicao.ocupada === true) {
    select.value = posicao.lote;
    document.getElementById('modalRz').value = posicao.rz || '';
    document.getElementById('modalVolume').value = posicao.volume || '';
  } else {
    select.value = '';
    document.getElementById('modalRz').value = '';
    document.getElementById('modalVolume').value = '';
  }

  modal.classList.remove('hidden');
}

// -------------------------------
// FECHAR MODAL
// -------------------------------
function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
  modalContext = null;
}

// -------------------------------
// CONFIRMAR ENDEREÇAMENTO
// -------------------------------
function confirmarEndereco() {
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

  // ===============================
  // 🔒 REGRA DE LOTE CHEIO (CORRETA)
  // ===============================
  const usados = contarGaylordsDoLote(loteNome);

  const mesmaPosicaoMesmoLote =
    posicao.ocupada === true && posicao.lote === loteNome;

  if (usados >= lote.total && !mesmaPosicaoMesmoLote) {
    alert(
      `Lote "${loteNome}" está cheio (${usados}/${lote.total})`
    );
    return;
  }

  // ===============================
  // ⚠️ CONFIRMAR SOBRESCRITA
  // ===============================
  if (
    posicao.ocupada === true &&
    posicao.lote !== loteNome
  ) {
    const confirmar = confirm(
      `Esta posição já está ocupada pelo lote "${posicao.lote}".\nDeseja substituir?`
    );
    if (!confirmar) return;
  }

  // ===============================
  // ALOCA
  // ===============================
  posicao.ocupada = true;
  posicao.lote = loteNome;
  posicao.rz = rz;
  posicao.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
}

// -------------------------------
// REMOVER GAYLORD
// -------------------------------
function removerGaylord() {
  if (!modalContext) return;

  const { areaIndex, ruaIndex, posicaoIndex } = modalContext;

  if (!confirm('Remover gaylord deste endereço?')) return;

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
}
