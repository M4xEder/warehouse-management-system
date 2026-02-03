// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let modalContext = null;

// -------------------------------
// CONTADOR DE GAYLORDS POR LOTE
// -------------------------------
function contarAlocadosPorLote(nomeLote) {
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
}

// -------------------------------
// ABRIR MODAL
// -------------------------------
window.abrirModal = function (areaIndex, ruaIndex, posicaoIndex) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  const area = state.areas[areaIndex];
  const rua = area.ruas[ruaIndex];
  const posicao = rua.posicoes[posicaoIndex];

  modalContext = { areaIndex, ruaIndex, posicaoIndex };

  // Select de lotes
  const select = document.getElementById('modalLote');
  select.innerHTML = '<option value="">Selecione</option>';

  state.lotes.forEach(lote => {
    const usados = contarAlocadosPorLote(lote.nome);
    const cheio = usados >= lote.total;

    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = `${lote.nome} (${usados}/${lote.total})`;

    // 🔒 bloqueia seleção se lote cheio
    if (cheio && posicao.lote !== lote.nome) {
      opt.disabled = true;
      opt.textContent += ' - CHEIO';
    }

    select.appendChild(opt);
  });

  // Carrega dados existentes
  select.value = posicao.lote || '';
  document.getElementById('modalRz').value = posicao.rz || '';
  document.getElementById('modalVolume').value = posicao.volume || '';

  modal.classList.remove('hidden');
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModal = function () {
  document.getElementById('modal').classList.add('hidden');
  modalContext = null;
};

// -------------------------------
// CONFIRMAR ENDEREÇAMENTO
// -------------------------------
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

  const posicao =
    state.areas[areaIndex]
      .ruas[ruaIndex]
      .posicoes[posicaoIndex];

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) {
    alert('Lote inválido');
    return;
  }

  const usados = contarAlocadosPorLote(loteNome);

  // 🔐 REGRA DE LOTE CHEIO
  if (!posicao.ocupada && usados >= lote.total) {
    alert(`Lote "${loteNome}" está cheio (${lote.total})`);
    return;
  }

  // Salva endereçamento
  posicao.ocupada = true;
  posicao.lote = loteNome;
  posicao.rz = rz;
  posicao.volume = volume || null;

  saveState();
  fecharModal();
  renderMapa();
};

// -------------------------------
// REMOVER GAYLORD
// -------------------------------
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
};
