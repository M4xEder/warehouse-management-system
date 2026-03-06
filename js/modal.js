// ===============================
// MODAL.JS — ENDEREÇAMENTO
// ===============================

let posicaoAtualId = null;


// ===============================
// ABRIR MODAL
// ===============================
window.abrirModalPorId = function (posId) {

  const pos = getPosicaoById(posId);

  if (!pos) {
    console.error("Posição não encontrada");
    return;
  }

  posicaoAtualId = pos.id;

  const modal = document.getElementById("modal");
  const selectLote = document.getElementById("modalLote");
  const volumeInput = document.getElementById("modalVolume");
  const rzInput = document.getElementById("modalRz");

  if (!modal) {
    console.error("Modal não encontrado");
    return;
  }

  // limpar campos
  volumeInput.value = "";
  rzInput.value = "";

  // carregar lotes
  selectLote.innerHTML = "";

  state.lotes.forEach(lote => {

    const opt = document.createElement("option");

    opt.value = lote.id;
    opt.textContent = lote.nome;

    selectLote.appendChild(opt);

  });

  // se posição já ocupada preencher dados
  if (pos.ocupada) {

    selectLote.value = pos.lote_id || "";
    volumeInput.value = pos.volume || "";
    rzInput.value = pos.rz || "";

  }

  modal.classList.remove("hidden");

};



// ===============================
// FECHAR MODAL
// ===============================
window.fecharModal = function () {

  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.add("hidden");
  }

  posicaoAtualId = null;

};



// ===============================
// CONFIRMAR ENDEREÇO
// ===============================
window.confirmarEndereco = async function () {

  if (!posicaoAtualId) return;

  const loteId = document.getElementById("modalLote").value;
  const volume = document.getElementById("modalVolume").value;
  const rz = document.getElementById("modalRz").value;

  try {

    const { error } = await window.supabaseClient
      .from("posicoes")
      .update({
        ocupada: true,
        lote_id: loteId,
        volume: volume,
        rz: rz
      })
      .eq("id", posicaoAtualId);

    if (error) throw error;

    fecharModal();

    await carregarSistema();

  } catch (err) {

    console.error("Erro ao endereçar:", err);
    alert("Erro ao salvar.");

  }

};



// ===============================
// REMOVER GAYLORD
// ===============================
window.removerGaylord = async function () {

  if (!posicaoAtualId) return;

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
      .eq("id", posicaoAtualId);

    if (error) throw error;

    fecharModal();

    await carregarSistema();

  } catch (err) {

    console.error("Erro ao remover:", err);
    alert("Erro ao remover.");

  }

};
