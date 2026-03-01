// ===============================
// MODAL.JS — SUPABASE INTEGRADO PRO (VERSÃO FINAL SEM STATUS)
// ===============================

let modalContext = {
  posicaoId: null,
  salvando: false
};

// --------------------------------------------------
// 🔒 VALIDADOR GLOBAL
// --------------------------------------------------
function validarState() {
  if (!window.state) throw new Error("State não definido");
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.posicoes)) state.posicoes = [];
  if (!Array.isArray(state.historicoExpedidos)) state.historicoExpedidos = [];
}

// --------------------------------------------------
// 🔒 CALCULAR SALDO REAL DO LOTE
// --------------------------------------------------
function calcularSaldoLote(loteId) {
  validarState();

  if (!loteId) return 0;

  const lote = state.lotes.find(l =>
    String(l.id) === String(loteId)
  );
  if (!lote) return 0;

  const total = Number(lote.quantidade ?? 0);

  const alocados = state.posicoes.filter(p =>
    p?.ocupada === true &&
    String(p?.lote_id) === String(loteId)
  ).length;

  const expedidos = state.historicoExpedidos.filter(h =>
    String(h?.lote_id) === String(loteId)
  ).length;

  return total - alocados - expedidos;
}

// --------------------------------------------------
// 🔒 ABRIR MODAL
// --------------------------------------------------
window.abrirModalPorId = function (posicaoId) {
  try {

    validarState();

    if (!posicaoId) {
      alert('ID inválido');
      return;
    }

    const pos = state.posicoes.find(p =>
      String(p.id) === String(posicaoId)
    );

    if (!pos) {
      alert('Posição não encontrada');
      return;
    }

    modalContext = { posicaoId, salvando: false };

    const modal = document.getElementById('modal');
    const selectLote = document.getElementById('modalLote');
    const inputRz = document.getElementById('modalRz');
    const inputVolume = document.getElementById('modalVolume');

    if (!modal || !selectLote || !inputRz || !inputVolume) {
      console.error("Elementos do modal não encontrados no DOM");
      return;
    }

    selectLote.innerHTML = '<option value="">Selecione um lote</option>';

    // 🔥 LISTAR LOTES BASEADO EM SALDO (SEM STATUS)
    state.lotes.forEach(lote => {

      const saldo = calcularSaldoLote(lote.id);

      if (saldo <= 0 && String(lote.id) !== String(pos.lote_id)) return;

      const opt = document.createElement('option');
      opt.value = lote.id;
      opt.textContent = `${lote.nome || 'Sem nome'} (Saldo: ${saldo})`;
      selectLote.appendChild(opt);
    });

    inputRz.value = pos?.rz ?? '';
    inputVolume.value = pos?.volume ?? '';

    const bloqueado = pos?.ocupada === true;

    selectLote.value = pos?.lote_id ?? '';
    selectLote.disabled = bloqueado;
    inputRz.disabled = bloqueado;
    inputVolume.disabled = bloqueado;

    modal.classList.remove('hidden');

  } catch (err) {
    console.error("Erro abrirModal:", err);
  }
};

// --------------------------------------------------
// 🔒 CONFIRMAR ENDEREÇAMENTO
// --------------------------------------------------
window.confirmarEndereco = async function () {

  if (modalContext.salvando) return;
  modalContext.salvando = true;

  try {

    validarState();

    const { posicaoId } = modalContext;

    const select = document.getElementById('modalLote');
    const inputRz = document.getElementById('modalRz');
    const inputVolume = document.getElementById('modalVolume');

    if (!select || !inputRz || !inputVolume) {
      alert("Campos do modal não encontrados");
      modalContext.salvando = false;
      return;
    }

    const loteId = select.value;
    const rz = inputRz.value.trim();
    const volume = inputVolume.value.trim();

    if (!loteId) {
      alert('Selecione um lote');
      modalContext.salvando = false;
      return;
    }

    if (!rz) {
      alert('RZ é obrigatório');
      modalContext.salvando = false;
      return;
    }

    const saldo = calcularSaldoLote(loteId);

    if (saldo <= 0) {
      alert('Lote sem saldo disponível');
      modalContext.salvando = false;
      return;
    }

    const dadosAtualizacao = {
      lote_id: loteId,
      volume: volume || null,
      rz,
      ocupada: true
    };

    // 🔥 Backup para rollback
    const posOriginal = {
      ...state.posicoes.find(p =>
        String(p.id) === String(posicaoId)
      )
    };

    // 🔥 Atualiza local primeiro (UX rápida)
    atualizarPosicaoLocal(posicaoId, dadosAtualizacao);

    // 🔥 Atualiza banco
    const { error } = await dbAtualizarPosicao(posicaoId, dadosAtualizacao);

    if (error) {

      console.error(error);

      // 🔥 Rollback automático
      atualizarPosicaoLocal(posicaoId, posOriginal);

      alert('Erro ao salvar no banco');
      modalContext.salvando = false;
      return;
    }

    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }

    fecharModal();

  } catch (err) {
    console.error("Erro confirmarEndereco:", err);
  }

  modalContext.salvando = false;
};

// --------------------------------------------------
// 🔒 REMOVER GAYLORD
// --------------------------------------------------
window.removerGaylord = async function () {

  if (!confirm('Remover gaylord desta posição?')) return;

  try {

    validarState();

    const { posicaoId } = modalContext;

    const pos = state.posicoes.find(p =>
      String(p.id) === String(posicaoId)
    );

    if (!pos) {
      alert("Posição não encontrada");
      return;
    }

    const backup = { ...pos };

    const dadosLimpar = {
      lote_id: null,
      volume: null,
      rz: null,
      ocupada: false
    };

    // Atualiza local
    atualizarPosicaoLocal(posicaoId, dadosLimpar);

    // Atualiza banco
    const { error } = await dbLiberarPosicao(posicaoId);

    if (error) {

      console.error(error);

      // Rollback
      atualizarPosicaoLocal(posicaoId, backup);

      alert("Erro ao liberar posição");
      return;
    }

    if (typeof atualizarDashboard === 'function') {
      atualizarDashboard();
    }

    fecharModal();

  } catch (err) {
    console.error("Erro removerGaylord:", err);
  }
};

// --------------------------------------------------
// 🔒 FECHAR MODAL
// --------------------------------------------------
window.fecharModal = function () {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.add('hidden');
};
