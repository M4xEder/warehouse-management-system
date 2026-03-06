// ===============================
// MAPA.JS — RENDERIZAÇÃO DO ARMAZÉM
// ===============================


// --------------------------------------------------
// RENDER MAPA
// --------------------------------------------------
window.renderMapa = function () {

  const mapa = document.getElementById("mapa");

  if (!mapa) {
    console.error("Elemento #mapa não encontrado.");
    return;
  }

  mapa.innerHTML = "";

  if (!window.state) {
    console.error("State não carregado.");
    return;
  }

  if (!state.areas || state.areas.length === 0) {

    const aviso = document.createElement("p");
    aviso.textContent = "Nenhuma área cadastrada.";

    mapa.appendChild(aviso);
    return;
  }


  // ==================================================
  // LOOP DE ÁREAS
  // ==================================================
  state.areas.forEach(area => {

    const areaDiv = document.createElement("div");
    areaDiv.className = "area";


    // --------------------------------------------------
    // HEADER DA ÁREA
    // --------------------------------------------------
    const headerArea = document.createElement("div");
    headerArea.className = "area-header";


    const tituloArea = document.createElement("h2");
    tituloArea.textContent = area.nome;


    // BOTÃO CRIAR RUA
    const btnCriarRua = document.createElement("button");
    btnCriarRua.textContent = "➕ Criar Rua";

    btnCriarRua.onclick = () => {

      if (typeof window.criarRua !== "function") {
        alert("Função criarRua não encontrada.");
        return;
      }

      window.criarRua(area.id);

    };


    // BOTÃO EXCLUIR ÁREA
    const btnExcluirArea = document.createElement("button");
    btnExcluirArea.textContent = "🗑 Excluir Área";

    btnExcluirArea.onclick = () => {

      if (typeof window.excluirArea !== "function") {
        alert("Função excluirArea não encontrada.");
        return;
      }

      window.excluirArea(area.id);

    };


    headerArea.appendChild(tituloArea);
    headerArea.appendChild(btnCriarRua);
    headerArea.appendChild(btnExcluirArea);

    areaDiv.appendChild(headerArea);


    // ==================================================
    // RUAS DA ÁREA
    // ==================================================
    const ruasDaArea = (state.ruas || []).filter(
      r => String(r.area_id) === String(area.id)
    );


    if (ruasDaArea.length === 0) {

      const vazio = document.createElement("p");
      vazio.textContent = "Nenhuma rua cadastrada.";

      areaDiv.appendChild(vazio);
      mapa.appendChild(areaDiv);

      return;
    }


    // ==================================================
    // LOOP DE RUAS
    // ==================================================
    ruasDaArea.forEach(rua => {

      const ruaDiv = document.createElement("div");
      ruaDiv.className = "rua";


      // --------------------------------------------------
      // HEADER DA RUA
      // --------------------------------------------------
      const ruaHeader = document.createElement("div");
      ruaHeader.className = "rua-header";


      const tituloRua = document.createElement("h3");

      tituloRua.textContent =
        `${rua.nome} (${rua.quantidade_posicoes || 0} posições)`;


      // BOTÃO EXCLUIR RUA
      const btnExcluirRua = document.createElement("button");
      btnExcluirRua.textContent = "🗑 Excluir Rua";

      btnExcluirRua.onclick = () => {

        if (typeof window.excluirRua !== "function") {
          alert("Função excluirRua não encontrada.");
          return;
        }

        window.excluirRua(rua.id);

      };


      ruaHeader.appendChild(tituloRua);
      ruaHeader.appendChild(btnExcluirRua);

      ruaDiv.appendChild(ruaHeader);


      // --------------------------------------------------
      // GRID DE POSIÇÕES
      // --------------------------------------------------
      const grid = document.createElement("div");
      grid.className = "grid-posicoes";


      const posicoesDaRua = (state.posicoes || [])
        .filter(p => String(p.rua_id) === String(rua.id))
        .sort((a, b) => Number(a.numero) - Number(b.numero));


      if (posicoesDaRua.length === 0) {

        const aviso = document.createElement("p");
        aviso.textContent = "Sem posições.";

        ruaDiv.appendChild(aviso);
        areaDiv.appendChild(ruaDiv);

        return;
      }


      // ==================================================
      // LOOP POSIÇÕES
      // ==================================================
      posicoesDaRua.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";

        posDiv.textContent = pos.numero || "-";


        // STATUS VISUAL
        if (pos.ocupada) {
          posDiv.classList.add("ocupada");
        } else {
          posDiv.classList.add("livre");
        }


        // CLIQUE NA POSIÇÃO
        posDiv.addEventListener("click", () => {

          if (typeof window.abrirModalPorId !== "function") {

            console.error("Função abrirModalPorId não encontrada.");
            alert("Erro: modal não carregado.");

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

  console.log("Mapa renderizado com sucesso.");

};
