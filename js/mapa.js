// ===============================
// MAPA.JS
// ===============================

window.renderMapa = function () {

  const mapa = document.getElementById("mapa");
  mapa.innerHTML = "";

  if (!state.areas || state.areas.length === 0) {
    mapa.innerHTML = "<p>Nenhuma área cadastrada.</p>";
    return;
  }

  state.areas.forEach(area => {

    const areaDiv = document.createElement("div");
    areaDiv.className = "area";

    // ----------------------------
    // HEADER ÁREA
    // ----------------------------
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";

    const titulo = document.createElement("h2");
    titulo.innerText = area.nome;

    const botoes = document.createElement("div");

    const btnCriarRua = document.createElement("button");
    btnCriarRua.innerText = "➕ Criar Rua";
    btnCriarRua.onclick = () => criarRua(area.id);

    const btnExcluirArea = document.createElement("button");
    btnExcluirArea.innerText = "🗑 Excluir Área";
    btnExcluirArea.onclick = () => excluirArea(area.id);

    botoes.appendChild(btnCriarRua);
    botoes.appendChild(btnExcluirArea);

    header.appendChild(titulo);
    header.appendChild(botoes);

    areaDiv.appendChild(header);

    // ----------------------------
    // RUAS DA ÁREA
    // ----------------------------
    const ruas = state.ruas.filter(r => r.area_id === area.id);

    ruas.forEach(rua => {

      const ruaDiv = document.createElement("div");
      ruaDiv.className = "rua";

      const ruaHeader = document.createElement("div");
      ruaHeader.style.display = "flex";
      ruaHeader.style.justifyContent = "space-between";

      const ruaTitulo = document.createElement("h3");
      ruaTitulo.innerText = `${rua.nome} (${rua.quantidade_posicoes} posições)`;

      const btnExcluirRua = document.createElement("button");
      btnExcluirRua.innerText = "🗑";
      btnExcluirRua.onclick = () => excluirRua(rua.id);

      ruaHeader.appendChild(ruaTitulo);
      ruaHeader.appendChild(btnExcluirRua);

      ruaDiv.appendChild(ruaHeader);

      // ----------------------------
      // POSIÇÕES
      // ----------------------------
      const grid = document.createElement("div");
      grid.className = "grid-posicoes";

      const posicoes = state.posicoes
        .filter(p => p.rua_id === rua.id)
        .sort((a,b) => a.numero - b.numero);

      posicoes.forEach(pos => {

        const posDiv = document.createElement("div");
        posDiv.className = "posicao";
        posDiv.innerText = pos.numero;

        if (pos.ocupada) {
          posDiv.style.background = "#ff6b6b";
        } else {
          posDiv.style.background = "#51cf66";
        }

        posDiv.onclick = () => abrirModalPorId(pos.id);

        grid.appendChild(posDiv);

      });

      ruaDiv.appendChild(grid);
      areaDiv.appendChild(ruaDiv);

    });

    mapa.appendChild(areaDiv);

  });

};
