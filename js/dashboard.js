// ==============================================
// DASHBOARD.JS — CONTROLE DE LOTES E RESUMO
// ==============================================


// ------------------------------------------------
// RENDER DASHBOARD COMPLETO
// ------------------------------------------------
window.renderDashboard = function () {

  const containerAtivos = document.getElementById("lotesAtivos");
  const containerExpedidos = document.getElementById("lotesExpedidos");

  if (!containerAtivos || !containerExpedidos) return;

  containerAtivos.innerHTML = "";
  containerExpedidos.innerHTML = "";

  if (!state?.lotes) return;


  // =====================================================
  // LOOP LOTES
  // =====================================================
  state.lotes.forEach(lote => {

    const totalPosicoes = contarGaylordsDoLote(lote.id);
    const totalExpedido = totalExpedidoDoLote(lote.id);

    const totalMovimentado = totalPosicoes + totalExpedido;

    const card = document.createElement("div");
    card.className = "lote-card";


    // ============================================
    // STATUS DO LOTE
    // ============================================
    if (totalMovimentado === 0) {

      card.classList.add("lote-ativo");

    }
    else if (totalExpedido > 0 && totalPosicoes > 0) {

      card.classList.add("lote-parcial");

    }
    else if (totalPosicoes === 0 && totalExpedido > 0) {

      card.classList.add("lote-total");

    }


    // ============================================
    // CONTEÚDO
    // ============================================
    card.innerHTML = `

      <h3>${lote.nome}</h3>

      <div class="resumo-lote">

        <p><b>Volume Total:</b> ${lote.volume_total || 0}</p>

        <p><b>No Armazém:</b> ${totalPosicoes}</p>

        <p><b>Expedido:</b> ${totalExpedido}</p>

      </div>

      <div class="acoes">

        <button onclick="verLote('${lote.id}')">
          Ver no mapa
        </button>

        <button onclick="expedirLote('${lote.id}')">
          Expedir
        </button>

      </div>

    `;


    // ============================================
    // DESTINO DO CARD
    // ============================================
    if (totalPosicoes === 0 && totalExpedido > 0) {

      containerExpedidos.appendChild(card);

    } else {

      containerAtivos.appendChild(card);

    }

  });


  // ============================================
  // RESUMO GERAL
  // ============================================
  renderResumoGeral();

};



// ==============================================
// RESUMO GERAL DO ARMAZÉM
// ==============================================
window.renderResumoGeral = function () {

  const cards = document.querySelectorAll(".dashboard-resumo .card");

  if (!cards.length) return;

  const totalLotes = state.lotes?.length || 0;

  const totalPosicoes = state.posicoes?.length || 0;

  const ocupadas =
    state.posicoes?.filter(p => p.ocupada === true).length || 0;

  const livres = totalPosicoes - ocupadas;

  const ocupacao = totalPosicoes
    ? ((ocupadas / totalPosicoes) * 100).toFixed(1)
    : 0;


  cards[0].querySelector("span").textContent = totalLotes;
  cards[1].querySelector("span").textContent = totalPosicoes;
  cards[2].querySelector("span").textContent = ocupadas;
  cards[3].querySelector("span").textContent = livres;
  cards[4].querySelector("span").textContent = ocupacao + "%";

};



// ==============================================
// VER LOTE NO MAPA
// ==============================================
window.verLote = function (loteId) {

  if (!state?.posicoes) return;

  state.posicoes.forEach(pos => {

    if (String(pos.lote_id) === String(loteId)) {

      pos._highlight = true;

    } else {

      delete pos._highlight;

    }

  });

  if (typeof renderMapa === "function") {

    renderMapa();

  }

};



// ==============================================
// EXPEDIR LOTE
// ==============================================
window.expedirLote = async function (loteId) {

  const qtd = prompt("Quantidade a expedir:");

  if (!qtd) return;

  const quantidade = Number(qtd);

  if (isNaN(quantidade) || quantidade <= 0) {

    alert("Quantidade inválida.");

    return;

  }


  try {

    const res = await dbRegistrarExpedicao({
      lote_id: loteId,
      quantidade: quantidade
    });

    if (res.error) throw res.error;

    alert("Expedição registrada.");

    if (typeof carregarSistema === "function") {

      carregarSistema();

    }

  }
  catch (err) {

    console.error(err);
    alert("Erro ao registrar expedição.");

  }

};
