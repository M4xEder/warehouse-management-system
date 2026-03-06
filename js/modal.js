// ======================================
// MODAL.JS — CONTROLE DE ENDEREÇAMENTO
// ======================================

let posicaoAtual = null;


// ======================================
// ABRIR MODAL POR ID DA POSIÇÃO
// ======================================
window.abrirModalPorId = function (posId) {

  const pos = state.posicoes.find(
    p => String(p.id) === String(posId)
  );

  if (!pos) {
    console.error("Posição não encontrada.");
    return;
  }

  posicaoAtual = pos;

  const modal = document.getElementById("modal");
  const titulo = document.getElementById("modalTitulo");

  const selectLote = document.getElementById("modalLote");
  const volumeInput = document.getElementById("modalVolume");
  const rzInput = document.getElementById("modalRz");

  modal.classList.remove("hidden");


  // ======================================
  // POSIÇÃO OCUPADA
  // ======================================
  if (pos.ocupada) {

    const lote = state.lotes.find(
      l => String(l.id) === String(pos.lote_id)
    );

    titulo.textContent =
      `Posição ${pos.numero} ocupada`;

    selectLote.innerHTML = `
      <option>${lote ? lote.nome : "Lote removido"}</option>
    `;

    volumeInput.value = pos.volume || "";
    rzInput.value = pos.rz || "";

    selectLote.disabled = true;
    volumeInput.disabled = true;
    rzInput.disabled = true;

  }

  // ======================================
  // POSIÇÃO LIVRE
  // ======================================
  else {

    titulo.textContent =
      `Endereçar posição ${pos.numero}`;

    selectLote.innerHTML = "";

    state.lotes.forEach(lote => {

      const opt = document.createElement("option");
      opt.value = lote.id;
      opt.textContent = lote.nome;

      selectLote.appendChild(opt);

    });

    volumeInput.value = "";
    rzInput.value = "";

    selectLote.disabled = false;
    volumeInput.disabled = false;
    rzInput.disabled = false;

  }

};


// ======================================
// FECHAR MODAL
// ======================================
window.fecharModal = function () {

  const modal = document.getElementById("modal");
  modal.classList.add("hidden");

  posicaoAtual = null;

};


// ======================================
// CONFIRMAR ENDEREÇO
// ======================================
window.confirmarEndereco = async function () {

  if (!posicaoAtual) return;

  if (posicaoAtual.ocupada) {
    alert("Esta posição já está ocupada.");
    return;
  }

  const loteId = document.getElementById("modalLote").value;
  const volume = document.getElementById("modalVolume").value.trim();
  const rz = document.getElementById("modalRz").value.trim();

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


    // ======================================
    // ATUALIZA ESTADO LOCAL
    // ======================================
    const pos = state.posicoes.find(
      p => String(p.id) === String(posicaoAtual.id)
    );

    if (pos) {

      pos.ocupada = true;
      pos.lote_id = loteId;
      pos.volume = volume;
      pos.rz = rz;

    }


    // ======================================
    // ATUALIZA TELA
    // ======================================
    if (typeof renderMapa === "function")
      renderMapa();

    if (typeof renderDashboard === "function")
      renderDashboard();


    fecharModal();

  }
  catch (err) {

    console.error(err);
    alert("Erro ao salvar endereço.");

  }

};


// ======================================
// REMOVER GAYLORD
// ======================================
window.removerGaylord = async function () {

  if (!posicaoAtual) return;

  if (!posicaoAtual.ocupada) {
    alert("Esta posição já está vazia.");
    return;
  }

  if (!confirm("Remover gaylord desta posição?"))
    return;

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
    // ATUALIZA ESTADO LOCAL
    // ======================================
    const pos = state.posicoes.find(
      p => String(p.id) === String(posicaoAtual.id)
    );

    if (pos) {

      pos.ocupada = false;
      pos.lote_id = null;
      pos.volume = null;
      pos.rz = null;

    }


    // ======================================
    // ATUALIZA TELA
    // ======================================
    if (typeof renderMapa === "function")
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
