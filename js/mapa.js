// ===============================
// MAPA.JS — ENTERPRISE STABLE UUID
// ===============================

// --------------------------------------------------
// INICIALIZAÇÃO
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

  console.log("🗺️ Inicializando mapa...");

  if (!window.state) {
    console.error("❌ State não encontrado.");
    return;
  }

  if (typeof renderMapa !== "function") {
    console.warn("⚠ renderMapa ainda não existe.");
  }

});

// --------------------------------------------------
// RENDER MAPA
// --------------------------------------------------
window.renderMapa = function () {

  const mapa = document.getElementById("mapa");

  if (!mapa) {
    console.error("❌ Elemento #mapa não encontrado no HTML");
    return;
  }

  mapa.innerHTML = "";

  // ======================================
  // SEM ÁREAS
  // ======================================
  if (!state.areas || state.areas.length === 0) {

    const aviso = document.createElement("p");
    aviso.textContent = "Nenhuma área cadastrada.";

    mapa.appendChild(aviso);
    return;
  }

  // ======================================
  // LOOP ÁREAS
  // ======================================
  state.areas.forEach(area => {

    const areaDiv = document.createElement("div");
    areaDiv.className = "area";

    const areaTitulo = document.createElement("h2");
    areaTitulo.textContent = area.nome || "Área sem nome";

    areaDiv.appendChild(areaTitulo);

    // BUSCA RUAS DA ÁREA
    const ruasDaArea = state.ruas.filter(rua =>
      String(rua.area_id) === String(area.id)
    );

    if (ruasDaArea.length === 0) {

      const vazio = document.createElement("p");
      vazio.textContent = "Sem ruas cadastradas";

      areaDiv.appendChild(vazio);
      mapa.appendChild(areaDiv);
      return;
    }

    // ======================================
    // LOOP RUAS
    // ======================================
    ruasDaArea.forEach(rua => {

      const ruaDiv = document.createElement("div");
      ruaDiv.className = "rua";

      const ruaTitulo = document.createElement("h3");
      ruaTitulo.textContent = rua.nome || "Rua";

      ruaDiv.appendChild(ruaTitulo);

      const grid = document.createElement("div");
      grid.className = "grid-posicoes";

      // BUSCA POSIÇÕES DA RUA
      const posicoesDaRua = state.posicoes
        .filter(pos => String(pos.rua_id) === String(rua.id))
        .sort((a, b) => Number(a.numero) - Number(b.numero));

      if (posicoesDaRua.length === 0) {

        const vazioRua = document.createElement("p");
        vazioRua.textContent = "Sem posições";

        ruaDiv.appendChild(vazioRua);
        areaDiv.appendChild(ruaDiv);
        return;
      }

      // ======================================
      // LOOP POSIÇÕES
      // ======================================
      posicoesDaRua.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";

        posDiv.textContent = pos.numero || "P";

        // -----------------------
        // STATUS
        // -----------------------
        if (pos.ocupada) {
          posDiv.classList.add("ocupada");
        } else {
          posDiv.classList.add("livre");
        }

        // -----------------------
        // CLIQUE
        // -----------------------
        posDiv.addEventListener("click", () => {

          if (!window.abrirModalPorId) {
            console.error("❌ abrirModalPorId não encontrado.");
            return;
          }

          window.abrirModalPorId(pos.id);
        });

        grid.appendChild(posDiv);

      });

      ruaDiv.appendChild(grid);
      areaDiv.appendChild(ruaDiv);

    });

    mapa.appendChild(areaDiv);

  });

  console.log("✅ Mapa renderizado");

};
