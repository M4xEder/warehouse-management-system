// ===============================
// MAPA.JS — RENDERIZAÇÃO DO ARMAZÉM
// ===============================


// ===============================
// CORES DOS LOTES
// ===============================
const coresLotes = [
  "#3498db",
  "#2ecc71",
  "#e67e22",
  "#9b59b6",
  "#e74c3c",
  "#1abc9c",
  "#f1c40f",
  "#34495e"
];

window.getCorDoLote = function (loteId) {

  if (!loteId) return "#bdc3c7";

  const index = state.lotes.findIndex(
    l => String(l.id) === String(loteId)
  );

  if (index === -1) return "#95a5a6";

  return coresLotes[index % coresLotes.length];
};



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


  // ==================================================
  // SEM ÁREAS
  // ==================================================
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

      if (!window.criarRua) {
        alert("Função criarRua não encontrada.");
        return;
      }

      window.criarRua(area.id);

    };


    // BOTÃO EXCLUIR ÁREA
    const btnExcluirArea = document.createElement("button");
    btnExcluirArea.textContent = "🗑 Excluir Área";

    btnExcluirArea.onclick = () => {

      if (!window.excluirArea) {
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
    const ruasDaArea = state.ruas
      ? state.ruas.filter(r => String(r.area_id) === String(area.id))
      : [];


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

        if (!window.excluirRua) {
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


      const posicoesDaRua = state.posicoes
        ? state.posicoes
            .filter(p => String(p.rua_id) === String(rua.id))
            .sort((a, b) => a.numero - b.numero)
        : [];


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

        posDiv.textContent = pos.numero;


        // =========================================
        // STATUS VISUAL + COR DO LOTE
        // =========================================
        if (pos.ocupada) {

          posDiv.classList.add("ocupada");

          const cor = getCorDoLote(pos.lote_id);

          posDiv.style.backgroundColor = cor;
          posDiv.style.color = "#fff";

        } else {

          posDiv.classList.add("livre");

          posDiv.style.backgroundColor = "#ecf0f1";

        }



        // =========================================
        // CLIQUE NA POSIÇÃO
        // =========================================
        posDiv.onclick = () => {

          if (!window.abrirModalPorId) {

            console.error("Função abrirModalPorId não encontrada.");
            return;

          }

          window.abrirModalPorId(pos.id);

        };


        grid.appendChild(posDiv);

      });


      ruaDiv.appendChild(grid);
      areaDiv.appendChild(ruaDiv);

    });


    mapa.appendChild(areaDiv);

  });

  console.log("Mapa renderizado com cores por lote.");

};
