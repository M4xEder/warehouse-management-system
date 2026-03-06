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

  renderMapa();

});


// --------------------------------------------------
// RENDER MAPA
// --------------------------------------------------
window.renderMapa = function () {

  const mapa = document.getElementById("mapa");

  if (!mapa) {
    console.error("❌ Elemento #mapa não encontrado");
    return;
  }

  mapa.innerHTML = "";

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


    // -------------------------------
    // CABEÇALHO DA ÁREA
    // -------------------------------
    const header = document.createElement("div");
    header.className = "area-header";

    const titulo = document.createElement("h2");
    titulo.textContent = area.nome;

    const controles = document.createElement("div");


    // BOTÃO CRIAR RUA
    const btnRua = document.createElement("button");
    btnRua.textContent = "➕ Rua";
    btnRua.onclick = () => criarRua(area.id);


    // BOTÃO EXCLUIR ÁREA
    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "🗑 Área";
    btnExcluir.onclick = () => excluirArea(area.id);


    controles.appendChild(btnRua);
    controles.appendChild(btnExcluir);

    header.appendChild(titulo);
    header.appendChild(controles);

    areaDiv.appendChild(header);


    // ======================================
    // RUAS DA ÁREA
    // ======================================
    const ruasDaArea = state.ruas.filter(
      rua => String(rua.area_id) === String(area.id)
    );

    if (ruasDaArea.length === 0) {

      const vazio = document.createElement("p");
      vazio.textContent = "Sem ruas cadastradas.";

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


      // -------------------------------
      // CABEÇALHO DA RUA
      // -------------------------------
      const ruaHeader = document.createElement("div");
      ruaHeader.className = "rua-header";


      const ruaTitulo = document.createElement("h3");
      ruaTitulo.textContent =
        rua.nome + " (" + rua.quantidade_posicoes + " posições)";


      const ruaControls = document.createElement("div");

      const btnExcluirRua = document.createElement("button");
      btnExcluirRua.textContent = "🗑";
      btnExcluirRua.onclick = () => excluirRua(rua.id);


      ruaControls.appendChild(btnExcluirRua);

      ruaHeader.appendChild(ruaTitulo);
      ruaHeader.appendChild(ruaControls);

      ruaDiv.appendChild(ruaHeader);


      // -------------------------------
      // GRID POSIÇÕES
      // -------------------------------
      const grid = document.createElement("div");
      grid.className = "grid-posicoes";


      const posicoes = state.posicoes
        .filter(p => String(p.rua_id) === String(rua.id))
        .sort((a, b) => a.numero - b.numero);


      posicoes.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";

        posDiv.textContent = pos.numero;

        if (pos.ocupada) {
          posDiv.classList.add("ocupada");
        } else {
          posDiv.classList.add("livre");
        }


        // CLICK ABRIR MODAL
        posDiv.onclick = () => {

          if (!window.abrirModalPorId) {
            console.error("❌ abrirModalPorId não encontrado");
            return;
          }

          abrirModalPorId(pos.id);
        };

        grid.appendChild(posDiv);

      });


      ruaDiv.appendChild(grid);
      areaDiv.appendChild(ruaDiv);

    });


    mapa.appendChild(areaDiv);

  });

  console.log("✅ mapa renderizado");

};
