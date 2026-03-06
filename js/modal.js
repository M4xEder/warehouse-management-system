// ======================================
// MODAL.JS — ENDEREÇAMENTO
// ======================================

let posicaoAtual = null;


// ======================================
// ABRIR MODAL
// ======================================
window.abrirModalPorId = function (posId) {

  const pos = state.posicoes.find(
    p => String(p.id) === String(posId)
  );

  if (!pos) return;

  posicaoAtual = pos;

  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  const titulo = document.getElementById("modalTitulo");
  const selectLote = document.getElementById("modalLote");
  const volume = document.getElementById("modalVolume");
  const rz = document.getElementById("modalRz");

  selectLote.innerHTML = "";


  // ======================================
  // POSIÇÃO OCUPADA
  // ======================================
  if (pos.ocupada) {

    titulo.innerText = "Posição ocupada";

    const lote = state.lotes.find(
      l => String(l.id) === String(pos.lote_id)
    );

    selectLote.innerHTML = `<option>${lote?.nome || "Lote"}</option>`;

    volume.value = pos.volume || "";
    rz.value = pos.rz || "";

    selectLote.disabled = true;
    volume.disabled = true;
    rz.disabled = true;

  }

  // ======================================
  // POSIÇÃO LIVRE
  // ======================================
  else {

    titulo.innerText = "Endereçar Gaylord";

    state.lotes.forEach(lote => {

      const opt = document.createElement("option");

      opt.value = lote.id;
      opt.innerText = lote.nome;

      selectLote.appendChild(opt);

    });

    volume.value = "";
    rz.value = "";

    selectLote.disabled = false;
    volume.disabled = false;
    rz.disabled = false;

  }

};


// ======================================
// FECHAR MODAL
// ======================================
window.fecharModal = function () {

  document.getElementById("modal").classList.add("hidden");

  posicaoAtual = null;

};


// ======================================
// CONFIRMAR ENDEREÇO
// ======================================
window.confirmarEndereco = async function () {

  if (!posicaoAtual) return;

  if (posicaoAtual.ocupada) {
    alert("Posição já ocupada.");
    return;
  }

  const loteId = document.getElementById("modalLote").value;
  const volume = document.getElementById("modalVolume").value.trim();
  const rz = document.getElementById("modalRz").value.trim();

  if (!volume) {
    alert("Volume obrigatório.");
    return;
  }

  if (!rz) {
    alert("RZ obrigatória.");
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


    // ======================================
    // ATUALIZA STATE LOCAL
    // ======================================
    const index = state.posicoes.findIndex(
      p => String(p.id) === String(posicaoAtual.id)
    );

    if (index !== -1) {

      state.posicoes[index] = {
        ...state.posicoes[index],
        ocupada: true,
        lote_id: loteId,
        volume: volume,
        rz: rz
      };

    }


    // ======================================
    // RENDER IMEDIATO
    // ======================================
    renderMapa();

    if (typeof renderDashboard === "function")
      renderDashboard();

    fecharModal();

  }
  catch (err) {

    console.error(err);
    alert("Erro ao salvar.");

  }

};


// ======================================
// REMOVER GAYLORD
// ======================================
window.removerGaylord = async function () {

  if (!posicaoAtual) return;

  if (!posicaoAtual.ocupada) {
    alert("Posição já vazia.");
    return;
  }

  if (!confirm("Remover Gaylord?")) return;

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


    // ======================================
    // ATUALIZA STATE
    // ======================================
    const index = state.posicoes.findIndex(
      p => String(p.id) === String(posicaoAtual.id)
    );

    if (index !== -1) {

      state.posicoes[index] = {
        ...state.posicoes[index],
        ocupada: false,
        lote_id: null,
        volume: null,
        rz: null
      };

    }


    renderMapa();

    if (typeof renderDashboard === "function")
      renderDashboard();

    fecharModal();

  }
  catch (err) {

    console.error(err);
    alert("Erro ao remover.");

  }

};
