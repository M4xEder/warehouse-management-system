// ===============================================
// MODAL.JS — CONTROLE DE ALOCAÇÃO DE POSIÇÕES
// ENTERPRISE SAFE + BLOQUEIO DE CAPACIDADE
// ===============================================


// ------------------------------------------------
// CONTEXTO DO MODAL
// ------------------------------------------------
window.modalContext = {
  posicaoId: null
};


// ------------------------------------------------
// CONTAR GAYLORDS DO LOTE NO MAPA
// ------------------------------------------------
function contarGaylordsDoLote(loteId) {

  if (!Array.isArray(state.posicoes)) return 0;

  return state.posicoes.filter(p =>
    p.ocupada &&
    String(p.lote_id) === String(loteId)
  ).length;

}


// ------------------------------------------------
// CONTAR GAYLORDS EXPEDIDOS
// ------------------------------------------------
function contarExpedidosDoLote(loteId) {

  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos.filter(e =>
    String(e.lote_id) === String(loteId)
  ).length;

}


// ------------------------------------------------
// VERIFICAR SE LOTE AINDA ESTÁ ATIVO
// ------------------------------------------------
function loteEstaAtivo(lote) {

  const alocados = contarGaylordsDoLote(lote.id);
  const expedidos = contarExpedidosDoLote(lote.id);

  const totalUtilizado = alocados + expedidos;

  return totalUtilizado < lote.quantidade;

}


// ------------------------------------------------
// ABRIR MODAL POR ID DA POSIÇÃO
// ------------------------------------------------
window.abrirModalPorId = function (posicaoId) {

  if (!window.state) return;

  const pos = state.posicoes?.find(
    p => String(p.id) === String(posicaoId)
  );

  if (!pos) return;

  modalContext.posicaoId = posicaoId;

  const modal = document.getElementById("modal");
  const loteSelect = document.getElementById("modalLote");
  const volumeInput = document.getElementById("modalVolume");
  const rzInput = document.getElementById("modalRz");

  if (!modal || !loteSelect || !volumeInput || !rzInput) return;

  modal.classList.remove("hidden");


  // LIMPAR CAMPOS
  loteSelect.innerHTML = "";
  volumeInput.value = "";
  rzInput.value = "";


  // ------------------------------------------------
  // CARREGAR APENAS LOTES ATIVOS
  // ------------------------------------------------
  if (Array.isArray(state.lotes)) {

    state.lotes.forEach(lote => {

      if (!loteEstaAtivo(lote)) return;

      const option = document.createElement("option");

      const alocados = contarGaylordsDoLote(lote.id);
      const expedidos = contarExpedidosDoLote(lote.id);
      const restante = lote.quantidade - (alocados + expedidos);

      option.value = lote.id;
      option.textContent = `${lote.nome} (restante: ${restante})`;

      loteSelect.appendChild(option);

    });

  }


  // ------------------------------------------------
  // POSIÇÃO JÁ OCUPADA
  // ------------------------------------------------
  if (pos.ocupada) {

    loteSelect.value = pos.lote_id || "";
    volumeInput.value = pos.volume || "";
    rzInput.value = pos.rz || "";

    loteSelect.disabled = true;
    volumeInput.disabled = true;
    rzInput.disabled = true;

  } else {

    loteSelect.disabled = false;
    volumeInput.disabled = false;
    rzInput.disabled = false;

  }

};


// ------------------------------------------------
// FECHAR MODAL
// ------------------------------------------------
window.fecharModal = function () {

  const modal = document.getElementById("modal");

  if (modal) modal.classList.add("hidden");

};


// ------------------------------------------------
// VALIDAR RZ DUPLICADA NO MESMO LOTE
// ------------------------------------------------
function rzDuplicada(loteId, rz, posicaoAtualId) {

  if (!Array.isArray(state.posicoes)) return false;

  return state.posicoes.some(p => {

    if (!p.ocupada) return false;

    if (String(p.id) === String(posicaoAtualId)) return false;

    return (
      String(p.lote_id) === String(loteId) &&
      String(p.rz).toLowerCase() === String(rz).toLowerCase()
    );

  });

}


// ------------------------------------------------
// BUSCAR LOTE
// ------------------------------------------------
function buscarLote(loteId) {

  if (!Array.isArray(state.lotes)) return null;

  return state.lotes.find(l =>
    String(l.id) === String(loteId)
  );

}


// ------------------------------------------------
// CONFIRMAR ENDEREÇO
// ------------------------------------------------
window.confirmarEndereco = async function () {

  const loteId = document.getElementById("modalLote").value;
  const volume = document.getElementById("modalVolume").value.trim();
  const rz = document.getElementById("modalRz").value.trim();

  if (!loteId) {
    alert("Selecione o lote.");
    return;
  }

  if (!volume) {
    alert("Informe o volume.");
    return;
  }

  if (!rz) {
    alert("Informe a RZ.");
    return;
  }

  const posId = modalContext.posicaoId;

  const pos = state.posicoes?.find(
    p => String(p.id) === String(posId)
  );

  if (!pos) return;


  // BLOQUEIO SE POSIÇÃO OCUPADA
  if (pos.ocupada) {

    alert("Esta posição já está ocupada.");
    return;

  }


  // VALIDAR RZ DUPLICADA
  if (rzDuplicada(loteId, rz, posId)) {

    alert("Esta RZ já foi usada neste lote.");
    return;

  }


  // BLOQUEIO DE CAPACIDADE DO LOTE
  const lote = buscarLote(loteId);

  if (!lote) {

    alert("Lote inválido.");
    return;

  }

  const usadas = contarGaylordsDoLote(loteId);
  const expedidas = contarExpedidosDoLote(loteId);

  if ((usadas + expedidas) >= lote.quantidade) {

    alert("Este lote já atingiu o limite total.");

    return;

  }


  try {

    const { error } = await window.supabaseClient
      .from("posicoes")
      .update({
        ocupada: true,
        lote_id: loteId,
        volume: volume,
        rz: rz
      })
      .eq("id", posId);

    if (error) throw error;


    pos.ocupada = true;
    pos.lote_id = loteId;
    pos.volume = volume;
    pos.rz = rz;


    if (typeof renderMapa === "function") renderMapa();
    if (typeof renderDashboard === "function") renderDashboard();


    fecharModal();

  } catch (err) {

    console.error(err);
    alert("Erro ao salvar posição.");

  }

};


// ------------------------------------------------
// REMOVER ALOCAÇÃO
// ------------------------------------------------
window.removerGaylord = async function () {

  const posId = modalContext.posicaoId;

  const pos = state.posicoes?.find(
    p => String(p.id) === String(posId)
  );

  if (!pos) return;

  if (!pos.ocupada) {

    alert("Esta posição já está livre.");
    return;

  }

  if (!confirm("Deseja remover esta alocação?")) return;


  try {

    const { error } = await window.supabaseClient
      .from("posicoes")
      .update({
        ocupada: false,
        lote_id: null,
        volume: null,
        rz: null
      })
      .eq("id", posId);

    if (error) throw error;


    pos.ocupada = false;
    pos.lote_id = null;
    pos.volume = null;
    pos.rz = null;


    if (typeof renderMapa === "function") renderMapa();
    if (typeof renderDashboard === "function") renderDashboard();


    fecharModal();

  } catch (err) {

    console.error(err);
    alert("Erro ao remover alocação.");

  }

};
