// =======================================
// BUSCA.JS
// Busca por LOTE, RZ ou VOLUME
// Compatível com UUID
// =======================================


// --------------------------------------------------
// LIMPAR DESTAQUES
// --------------------------------------------------
window.limparDestaques = function () {

  if (!state || !state.posicoes) return;

  state.posicoes.forEach(pos => {
    delete pos._highlight;
  });

};



// --------------------------------------------------
// BUSCAR
// --------------------------------------------------
window.buscar = function () {

  const input = document.getElementById("buscaInput");

  if (!input) return;

  const termo = input.value?.trim().toLowerCase();

  if (!termo) {
    alert("Digite um Lote, Volume ou RZ.");
    return;
  }

  if (!state || !state.posicoes || !state.lotes) {
    alert("Sistema ainda carregando.");
    return;
  }

  let encontrados = 0;


  // ======================================
  // LOOP POSIÇÕES
  // ======================================
  state.posicoes.forEach(pos => {

    delete pos._highlight;

    if (!pos.ocupada) return;


    // -------------------------------
    // LOTE
    // -------------------------------
    let nomeLote = "";

    if (pos.lote_id) {

      const lote = state.lotes.find(
        l => String(l.id) === String(pos.lote_id)
      );

      nomeLote = lote?.nome?.toLowerCase() || "";

    }


    // -------------------------------
    // RZ
    // -------------------------------
    const rz = pos.rz ? String(pos.rz).toLowerCase() : "";


    // -------------------------------
    // VOLUME
    // -------------------------------
    const volume = pos.volume
      ? String(pos.volume).toLowerCase()
      : "";


    // -------------------------------
    // MATCH
    // -------------------------------
    const encontrou =
      nomeLote.includes(termo) ||
      rz.includes(termo) ||
      volume.includes(termo);


    if (encontrou) {

      pos._highlight = true;

      encontrados++;

    }

  });


  // ======================================
  // RESULTADO
  // ======================================
  if (encontrados === 0) {

    alert("Nenhum resultado encontrado.");

  }


  // ======================================
  // RENDER MAPA
  // ======================================
  if (typeof renderMapa === "function") {

    renderMapa();

  }

};



// --------------------------------------------------
// LIMPAR BUSCA
// --------------------------------------------------
window.limparBusca = function () {

  limparDestaques();

  const input = document.getElementById("buscaInput");

  if (input) input.value = "";

  if (typeof renderMapa === "function") {

    renderMapa();

  }

};
