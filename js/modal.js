// ===============================================
// MODAL.JS — CONTROLE DE ALOCAÇÃO DE POSIÇÕES
// ENTERPRISE SAFE
// ===============================================


// ------------------------------------------------
// CONTEXTO DO MODAL
// ------------------------------------------------
window.modalContext = {
  posicaoId: null
};


// ------------------------------------------------
// ABRIR MODAL POR ID DA POSIÇÃO
// ------------------------------------------------
window.abrirModalPorId = function (posicaoId) {

  const pos = state.posicoes.find(
    p => String(p.id) === String(posicaoId)
  );

  if (!pos) return;

  modalContext.posicaoId = posicaoId;

  const modal = document.getElementById("modal");
  const loteSelect = document.getElementById("loteSelect");
  const volumeInput = document.getElementById("volumeInput");
  const rzInput = document.getElementById("rzInput");

  if (!modal) return;

  modal.classList.remove("hidden");


  // ----------------------------------------
  // LIMPAR CAMPOS
  // ----------------------------------------
  loteSelect.innerHTML = "";
  volumeInput.value = "";
  rzInput.value = "";


  // ----------------------------------------
  // CARREGAR LOTES
  // ----------------------------------------
  state.lotes.forEach(lote => {

    const option = document.createElement("option");

    option.value = lote.id;
    option.textContent = lote.nome;

    loteSelect.appendChild(option);

  });


  // ----------------------------------------
  // SE POSIÇÃO JÁ ESTÁ OCUPADA
  // ----------------------------------------
  if (pos.ocupada) {

    loteSelect.value = pos.lote_id || "";
    volumeInput.value = pos.volume || "";
    rzInput.value = pos.rz || "";

    loteSelect.disabled = true;
    volumeInput.disabled = true;
    rzInput.disabled = true;

    const info = document.getElementById("infoPosicao");

    if (info) {

      const lote = state.lotes.find(
        l => String(l.id) === String(pos.lote_id)
      );

      info.innerHTML = `
      <p><b>Lote:</b> ${lote?.nome || ""}</p>
      <p><b>Volume:</b> ${pos.volume}</p>
      <p><b>RZ:</b> ${pos.rz}</p>
      `;

    }

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

  if (modal) {
    modal.classList.add("hidden");
  }

};



// ------------------------------------------------
// VALIDAR RZ DUPLICADA NO MESMO LOTE
// ------------------------------------------------
function rzDuplicada(loteId, rz, posicaoAtualId) {

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
// SALVAR POSIÇÃO
// ------------------------------------------------
window.salvarPosicao = async function () {

  const loteId = document.getElementById("loteSelect").value;
  const volume = document.getElementById("volumeInput").value.trim();
  const rz = document.getElementById("rzInput").value.trim();

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

  const pos = state.posicoes.find(
    p => String(p.id) === String(posId)
  );

  if (!pos) return;


  // ----------------------------------------
  // BLOQUEIO SE JÁ OCUPADA
  // ----------------------------------------
  if (pos.ocupada) {

    alert("Esta posição já está ocupada. Remova para alterar.");

    return;

  }


  // ----------------------------------------
  // VALIDAR RZ DUPLICADA
  // ----------------------------------------
  if (rzDuplicada(loteId, rz, posId)) {

    alert("Esta RZ já foi usada neste lote.");

    return;

  }


  try {

    // ----------------------------------------
    // ATUALIZA BANCO
    // ----------------------------------------
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


    // ----------------------------------------
    // ATUALIZA ESTADO LOCAL
    // ----------------------------------------
    pos.ocupada = true;
    pos.lote_id = loteId;
    pos.volume = volume;
    pos.rz = rz;


    // ----------------------------------------
    // RENDER IMEDIATO
    // ----------------------------------------
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
window.removerAlocacao = async function () {

  const posId = modalContext.posicaoId;

  const pos = state.posicoes.find(
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


    // ----------------------------------------
    // ATUALIZA ESTADO LOCAL
    // ----------------------------------------
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
