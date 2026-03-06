// ===============================
// AREAS.JS — CONTROLE DE ÁREAS
// ===============================


// ===============================
// CARREGAR ÁREAS DO BANCO
// ===============================
window.carregarAreasDoBanco = async function () {

  try {

    const { data, error } = await window.supabaseClient
      .from("areas")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    state.areas = data || [];

  } catch (err) {

    console.error("Erro ao carregar áreas:", err);
    state.areas = [];

  }

};



// ===============================
// BUSCAR ÁREA POR ID
// ===============================
window.buscarAreaPorId = function (areaId) {

  if (!state.areas) return null;

  return state.areas.find(
    area => String(area.id) === String(areaId)
  );

};



// ===============================
// CRIAR ÁREA
// ===============================
window.criarArea = async function () {

  const input = document.getElementById("areaNome");

  if (!input) return;

  const nome = input.value.trim();

  if (!nome) {

    alert("Digite o nome da área");
    return;

  }

  try {

    // 🔎 Verificar duplicidade
    const { data: existentes } =
      await window.supabaseClient
        .from("areas")
        .select("id")
        .eq("nome", nome);

    if (existentes && existentes.length > 0) {

      alert("Já existe uma área com esse nome.");
      return;

    }

    // ➕ Criar área
    const { error } =
      await window.supabaseClient
        .from("areas")
        .insert([{ nome }]);

    if (error) throw error;

    input.value = "";

    // 🔄 Atualiza sistema
    if (typeof carregarSistema === "function") {
      await carregarSistema();
    }

    console.log("Área criada com sucesso");

  } catch (err) {

    console.error("Erro ao criar área:", err);
    alert("Erro ao criar área");

  }

};



// ===============================
// EXCLUIR ÁREA
// ===============================
window.excluirArea = async function (areaId) {

  const area = buscarAreaPorId(areaId);

  if (!area) {

    alert("Área não encontrada");
    return;

  }

  if (!confirm(`Excluir área "${area.nome}"?`)) {
    return;
  }

  try {

    const { error } =
      await window.supabaseClient
        .from("areas")
        .delete()
        .eq("id", areaId);

    if (error) throw error;

    await carregarSistema();

    console.log("Área excluída");

  } catch (err) {

    console.error("Erro ao excluir área:", err);
    alert("Erro ao excluir área");

  }

};



// ===============================
// EDITAR ÁREA
// ===============================
window.editarArea = async function (areaId) {

  const area = buscarAreaPorId(areaId);

  if (!area) return;

  const novoNome = prompt(
    "Novo nome da área:",
    area.nome
  );

  if (!novoNome || !novoNome.trim()) return;

  try {

    const { error } =
      await window.supabaseClient
        .from("areas")
        .update({
          nome: novoNome.trim()
        })
        .eq("id", areaId);

    if (error) throw error;

    await carregarSistema();

    console.log("Área atualizada");

  } catch (err) {

    console.error("Erro ao editar área:", err);
    alert("Erro ao editar área");

  }

};
