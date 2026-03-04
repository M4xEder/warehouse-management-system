// ===============================
// MAPA.JS — ENTERPRISE STABLE
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  inicializarMapa();
});

// --------------------------------------------------
// INICIALIZAR MAPA
// --------------------------------------------------
function inicializarMapa() {

  if (!window.state) {
    console.error("State não carregado");
    return;
  }

  renderizarMapa();
}

// --------------------------------------------------
// RENDERIZAR MAPA
// --------------------------------------------------
window.renderizarMapa = function () {

  const mapa = document.getElementById("mapa");
  if (!mapa) return;

  mapa.innerHTML = "";

  if (!state.areas || state.areas.length === 0) {
    mapa.innerHTML = "<p>Nenhuma área cadastrada.</p>";
    return;
  }

  state.areas.forEach(area => {

    const areaDiv = document.createElement("div");
    areaDiv.className = "area";

    const titulo = document.createElement("h2");
    titulo.textContent = area.nome || "Área sem nome";
    areaDiv.appendChild(titulo);

    if (!area.ruas || area.ruas.length === 0) {
      const vazio = document.createElement("p");
      vazio.textContent = "Sem ruas cadastradas";
      areaDiv.appendChild(vazio);
      mapa.appendChild(areaDiv);
      return;
    }

    area.ruas.forEach(rua => {

      const ruaDiv = document.createElement("div");
      ruaDiv.className = "rua";

      const nomeRua = document.createElement("h3");
      nomeRua.textContent = rua.nome || "Rua sem nome";
      ruaDiv.appendChild(nomeRua);

      const grid = document.createElement("div");
      grid.className = "grid-posicoes";

      if (!rua.posicoes || rua.posicoes.length === 0) {
        const vazioRua = document.createElement("p");
        vazioRua.textContent = "Sem posições";
        ruaDiv.appendChild(vazioRua);
        areaDiv.appendChild(ruaDiv);
        return;
      }

      rua.posicoes.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";

        posDiv.textContent = pos.nome || pos.codigo || "P";

        // =========================
        // STATUS VISUAL
        // =========================
        if (pos.ocupada) {
          posDiv.classList.add("ocupada");
        } else {
          posDiv.classList.add("livre");
        }

        // =========================
        // CLIQUE
        // =========================
        posDiv.addEventListener("click", () => {

          if (!window.abrirModalPorId) {
            console.error("abrirModalPorId não carregado");
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
};
