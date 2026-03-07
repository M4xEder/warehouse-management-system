// ==============================================
// MAPA.JS — RENDERIZAÇÃO DO ARMAZÉM (PRO)
// ==============================================


// ------------------------------------------------
// GERADOR DE COR POR LOTE
// ------------------------------------------------
function corDoLote(loteId) {

  if (!loteId) return "#e5e7eb";

  const cores = [
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#a78bfa",
    "#fb923c",
    "#22c55e",
    "#06b6d4",
    "#f472b6"
  ];

  const index =
    Math.abs(
      String(loteId)
        .split("")
        .reduce((a, b) => a + b.charCodeAt(0), 0)
    ) % cores.length;

  return cores[index];
}



// ------------------------------------------------
// RENDER MAPA
// ------------------------------------------------
window.renderMapa = function () {

  const mapa = document.getElementById("mapa");

  if (!mapa) {
    console.error("Elemento #mapa não encontrado.");
    return;
  }

  mapa.innerHTML = "";


  if (!state?.areas || state.areas.length === 0) {

    const aviso = document.createElement("p");
    aviso.textContent = "Nenhuma área cadastrada.";

    mapa.appendChild(aviso);

    return;
  }


  // ============================================
  // LOOP ÁREAS
  // ============================================
  state.areas.forEach(area => {

    const areaDiv = document.createElement("div");
    areaDiv.className = "area";


    // HEADER ÁREA
    const header = document.createElement("div");
    header.className = "area-header";


    const titulo = document.createElement("h2");
    titulo.textContent = area.nome;


    // BOTÃO CRIAR RUA
    const btnCriarRua = document.createElement("button");
    btnCriarRua.textContent = "➕ Criar Rua";

    btnCriarRua.onclick = () => {

      if (window.criarRua) {
        window.criarRua(area.id);
      } else {
        alert("Função criarRua não encontrada.");
      }

    };


    // BOTÃO EXCLUIR ÁREA
    const btnExcluirArea = document.createElement("button");
    btnExcluirArea.textContent = "🗑 Excluir Área";

    btnExcluirArea.onclick = () => {

      if (window.excluirArea) {
        window.excluirArea(area.id);
      } else {
        alert("Função excluirArea não encontrada.");
      }

    };


    header.appendChild(titulo);
    header.appendChild(btnCriarRua);
    header.appendChild(btnExcluirArea);

    areaDiv.appendChild(header);


    // ============================================
    // RUAS DA ÁREA
    // ============================================
    const ruas = (state.ruas || []).filter(
      r => String(r.area_id) === String(area.id)
    );


    if (ruas.length === 0) {

      const vazio = document.createElement("p");
      vazio.textContent = "Nenhuma rua cadastrada.";

      areaDiv.appendChild(vazio);
      mapa.appendChild(areaDiv);

      return;

    }


    // ============================================
    // LOOP RUAS
    // ============================================
    ruas.forEach(rua => {

      const ruaDiv = document.createElement("div");
      ruaDiv.className = "rua";


      const ruaHeader = document.createElement("div");
      ruaHeader.className = "rua-header";


      const tituloRua = document.createElement("h3");

      tituloRua.textContent =
        `${rua.nome} (${rua.quantidade_posicoes || 0} posições)`;


      const btnExcluirRua = document.createElement("button");
      btnExcluirRua.textContent = "🗑 Excluir Rua";

      btnExcluirRua.onclick = () => {

        if (window.excluirRua) {
          window.excluirRua(rua.id);
        } else {
          alert("Função excluirRua não encontrada.");
        }

      };


      ruaHeader.appendChild(tituloRua);
      ruaHeader.appendChild(btnExcluirRua);

      ruaDiv.appendChild(ruaHeader);


      // CONTAINER HORIZONTAL
      const grid = document.createElement("div");
      grid.className = "posicoes";


      const posicoes = (state.posicoes || [])
        .filter(p => String(p.rua_id) === String(rua.id))
        .sort((a, b) => a.numero - b.numero);


      if (posicoes.length === 0) {

        const aviso = document.createElement("p");
        aviso.textContent = "Sem posições.";

        ruaDiv.appendChild(aviso);
        areaDiv.appendChild(ruaDiv);

        return;

      }


      // ============================================
      // LOOP POSIÇÕES
      // ============================================
      posicoes.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";

        posDiv.textContent = pos.numero;


        if (pos.ocupada) {

          posDiv.classList.add("ocupada");

          posDiv.style.background =
            corDoLote(pos.lote_id);


          const lote = (state.lotes || []).find(
            l => String(l.id) === String(pos.lote_id)
          );

          posDiv.title =
            `Lote: ${lote?.nome || ""}\n` +
            `Volume: ${pos.volume || ""}\n` +
            `RZ: ${pos.rz || ""}`;

        } else {

          posDiv.classList.add("livre");

        }


        if (pos._highlight) {

          posDiv.style.border = "3px solid red";
          posDiv.style.boxShadow = "0 0 10px red";

        }


        posDiv.onclick = () => {

          if (window.abrirModalPorId) {
            window.abrirModalPorId(pos.id);
          } else {
            console.error("Função abrirModalPorId não encontrada.");
          }

        };


        grid.appendChild(posDiv);

      });


      ruaDiv.appendChild(grid);
      areaDiv.appendChild(ruaDiv);

    });


    mapa.appendChild(areaDiv);

  });


  console.log("Mapa renderizado.");

};
