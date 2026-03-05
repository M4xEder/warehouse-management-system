// ===============================
// MAPA.JS — ENTERPRISE STABLE UUID
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

  renderMapa();
}

// --------------------------------------------------
// RENDER MAPA
// --------------------------------------------------
window.renderMapa = function () {

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

    const header = document.createElement("div");
    header.className = "area-header";
    header.textContent = area.nome || "Área";
    areaDiv.appendChild(header);

    // BUSCAR RUAS DA ÁREA
    const ruasDaArea = state.ruas.filter(r =>
      String(r.area_id) === String(area.id)
    );

    if (ruasDaArea.length === 0) {

      const vazio = document.createElement("p");
      vazio.textContent = "Sem ruas cadastradas";
      areaDiv.appendChild(vazio);
      mapa.appendChild(areaDiv);
      return;
    }

    ruasDaArea.forEach(rua => {

      const ruaDiv = document.createElement("div");
      ruaDiv.className = "rua";

      const ruaHeader = document.createElement("div");
      ruaHeader.className = "rua-header";
      ruaHeader.textContent = rua.nome || "Rua";
      ruaDiv.appendChild(ruaHeader);

      const posContainer = document.createElement("div");
      posContainer.className = "posicoes";

      // BUSCAR POSIÇÕES DA RUA
      const posicoesDaRua = state.posicoes
        .filter(p => String(p.rua_id) === String(rua.id))
        .sort((a,b) => Number(a.numero) - Number(b.numero));

      if (posicoesDaRua.length === 0) {

        const vazio = document.createElement("p");
        vazio.textContent = "Sem posições";
        ruaDiv.appendChild(vazio);
        areaDiv.appendChild(ruaDiv);
        return;
      }

      posicoesDaRua.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";

        posDiv.textContent = pos.numero || "P";

        // STATUS VISUAL
        if (pos.ocupada) {
          posDiv.classList.add("ocupada");
        }

        // CLIQUE
        posDiv.addEventListener("click", () => {

          if (!window.abrirModalPorId) {
            console.error("Função abrirModalPorId não carregada");
            return;
          }

          window.abrirModalPorId(pos.id);
        });

        posContainer.appendChild(posDiv);
      });

      ruaDiv.appendChild(posContainer);
      areaDiv.appendChild(ruaDiv);
    });

    mapa.appendChild(areaDiv);
  });
};
