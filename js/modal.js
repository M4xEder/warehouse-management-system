// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let posicaoAtual = null;


// ========================================
// ABRIR MODAL
// ========================================
window.abrirModalPorId = function (posId) {

  const pos = state.posicoes.find(p => String(p.id) === String(posId));

  if (!pos) {
    console.error("Posição não encontrada");
    return;
  }

  posicaoAtual = pos;

  const modal = document.getElementById("modal");
  const loteSelect = document.getElementById("modalLote");
  const volumeInput = document.getElementById("modalVolume");
  const rzInput = document.getElementById("modalRz");

  modal.classList.remove("hidden");


  // ===============================
  // CARREGAR LOTES
  // ===============================
  loteSelect.innerHTML = "";

  state.lotes.forEach(lote => {

    const opt = document.createElement("option");

    opt.value = lote.id;
    opt.textContent = lote.nome;

    loteSelect.appendChild(opt);

  });


  // ===============================
  // POSIÇÃO OCUPADA
  // ===============================
  if (pos.ocupada) {

    loteSelect.value = pos.lote_id || "";
    volumeInput.value = pos.volume || "";
    rzInput.value = pos.rz || "";

    loteSelect.disabled = true;
    volumeInput.disabled = true;
    rzInput.disabled = true;

  } else {

    volumeInput.value = "";
    rzInput.value = "";

    loteSelect.disabled = false;
    volumeInput.disabled = false;
    rzInput.disabled = false;

  }

};



// ========================================
// FECHAR MODAL
// ========================================
window.fecharModal = function () {

  const modal = document.getElementById("modal");

  modal.classList.add("hidden");

  posicaoAtual = null;

};



// ========================================
// CONFIRMAR ENDEREÇO
// ========================================
window.confirmarEndereco = async function () {

  if (!posicaoAtual) return;

  if (posicaoAtual.ocupada) {

    alert("Esta posição já está ocupada.\nRemova o gaylord para alterar.");

    return;
  }

  const loteId = document.getElementById("modalLote").value;
  const volume = document.getElementById("modalVolume").value;
  const rz = document.getElementById("modalRz").value;


  // ====================================
  // VALIDAÇÕES OBRIGATÓRIAS
  // ====================================
  if (!loteId) {

    alert("Selecione um lote.");
    return;

  }

  if (!volume) {

    alert("Volume é obrigatório.");
    return;

  }

  if (!rz) {

    alert("RZ é obrigatória.");
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
      .eq("id", posicaoAtual.id);

    if (error) throw error;

    fecharModal();

  } catch (err) {

    console.error(err);
    alert("Erro ao salvar endereço.");

  }

};



// ========================================
// REMOVER GAYLORD
// ========================================
window.removerGaylord = async function () {

  if (!posicaoAtual) return;

  if (!confirm("Remover gaylord desta posição?")) return;

  try {

    const { error } = await window.supabaseClient
      .from("posicoes")
      .update({
        ocupada: false,
        lote_id: null,
        volume: null,
        rz: null
      })
      .eq("id", posicaoAtual.id);

    if (error) throw error;

    fecharModal();

  } catch (err) {

    console.error(err);
    alert("Erro ao remover.");

  }

};
