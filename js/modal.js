// ===============================
// MODAL.JS — SUPABASE ENTERPRISE REALTIME
// ===============================

let modalContext = {
  posicaoId: null,
  salvando: false
};

// --------------------------------------------------
// ABRIR MODAL
// --------------------------------------------------
window.abrirModalPorId = function (posicaoId) {

  if (!posicaoId) return alert("ID inválido");

  const pos = state.posicoes.find(p =>
    String(p.id) === String(posicaoId)
  );

  if (!pos) return alert("Posição não encontrada");

  modalContext = { posicaoId, salvando: false };

  const modal = document.getElementById("modal");
  const select = document.getElementById("modalLote");
  const inputRz = document.getElementById("modalRz");
  const inputVolume = document.getElementById("modalVolume");

  select.innerHTML = '<option value="">Selecione um lote</option>';

  state.lotes.forEach(lote => {

    const saldo = calcularSaldoLote(lote.id);
    if (saldo <= 0 && String(lote.id) !== String(pos.lote_id)) return;

    const opt = document.createElement("option");
    opt.value = lote.id;
    opt.textContent = `${lote.nome || "Sem nome"} (Saldo: ${saldo})`;
    select.appendChild(opt);
  });

  select.value = pos.lote_id || "";
  inputRz.value = pos.rz || "";
  inputVolume.value = pos.volume || "";

  modal.classList.remove("hidden");
};

// --------------------------------------------------
// CONFIRMAR ENDEREÇAMENTO
// --------------------------------------------------
window.confirmarEndereco = async function () {

  if (modalContext.salvando) return;
  modalContext.salvando = true;

  try {

    const { posicaoId } = modalContext;

    const select = document.getElementById("modalLote");
    const inputRz = document.getElementById("modalRz");
    const inputVolume = document.getElementById("modalVolume");

    const loteId = select.value;
    const rz = inputRz.value.trim();
    const volume = inputVolume.value.trim();

    if (!loteId) {
      alert("Selecione um lote");
      modalContext.salvando = false;
      return;
    }

    if (!rz) {
      alert("RZ obrigatório");
      modalContext.salvando = false;
      return;
    }

    const { error } = await supabaseClient
      .from("posicoes")
      .update({
        lote_id: String(loteId),
        rz,
        volume: volume || null,
        ocupada: true
      })
      .eq("id", String(posicaoId));

    if (error) throw error;

    fecharModal();

  } catch (err) {
    console.error("Erro confirmarEndereco:", err);
    alert("Erro ao salvar no banco.");
  }

  modalContext.salvando = false;
};

// --------------------------------------------------
// REMOVER GAYLORD
// --------------------------------------------------
window.removerGaylord = async function () {

  if (!confirm("Remover gaylord desta posição?")) return;

  try {

    const { posicaoId } = modalContext;

    const { error } = await supabaseClient
      .from("posicoes")
      .update({
        lote_id: null,
        rz: null,
        volume: null,
        ocupada: false
      })
      .eq("id", String(posicaoId));

    if (error) throw error;

    fecharModal();

  } catch (err) {
    console.error("Erro removerGaylord:", err);
    alert("Erro ao remover.");
  }
};

// --------------------------------------------------
// FECHAR MODAL
// --------------------------------------------------
window.fecharModal = function () {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");
};
