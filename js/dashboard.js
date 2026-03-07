// ==============================================
// DASHBOARD.JS — CONTROLE DE LOTES (COM REGRAS)
// ==============================================


// ------------------------------------------------
// CONTAR ALOCADOS NO MAPA
// ------------------------------------------------
function contarAlocados(loteId) {

  if (!state?.posicoes) return 0;

  return state.posicoes.filter(p =>
    p.ocupada === true &&
    String(p.lote_id) === String(loteId)
  ).length;

}



// ------------------------------------------------
// CONTAR EXPEDIDOS
// ------------------------------------------------
function contarExpedidos(loteId) {

  if (!state?.historicoExpedidos) return 0;

  return state.historicoExpedidos
    .filter(e => String(e.lote_id) === String(loteId))
    .reduce((soma, e) => soma + (Number(e.quantidade) || 0), 0);

}



// ------------------------------------------------
// RENDER LOTES
// ------------------------------------------------
window.renderDashboard = function () {

  const ativos = document.getElementById("lotesAtivos");
  const expedidos = document.getElementById("lotesExpedidos");

  if (!ativos || !expedidos) return;

  ativos.innerHTML = "";
  expedidos.innerHTML = "";

  if (!state?.lotes) return;


  state.lotes.forEach(lote => {

    const total = Number(lote.volume_total || lote.total || 0);

    const alocados = contarAlocados(lote.id);

    const expedidosQtd = contarExpedidos(lote.id);

    const naoAlocados = Math.max(0, total - alocados);

    const saldoDisponivel = Math.max(0, total - expedidosQtd);


    // STATUS
    let status = "Ativo";

    if (saldoDisponivel === 0) {
      status = "Finalizado";
    }
    else if (expedidosQtd > 0) {
      status = "Parcial";
    }


    const card = document.createElement("div");

    card.className = "lote-card";


    card.innerHTML = `
    
      <h3>${lote.nome}</h3>

      <div class="resumo-lote">

        <p><b>Total:</b> ${total}</p>

        <p><b>Alocados:</b> ${alocados}</p>

        <p><b>Não alocados:</b> ${naoAlocados}</p>

        <p><b>Expedidos:</b> ${expedidosQtd}</p>

        <p><b>Saldo disponível:</b> ${saldoDisponivel}</p>

        <p><b>Status:</b> ${status}</p>

      </div>

      <div class="acoes">

        <button onclick="expedirLote('${lote.id}')">
          Expedir
        </button>

        <button onclick="alterarLote('${lote.id}')">
          Alterar
        </button>

      </div>
    
    `;


    if (saldoDisponivel === 0) {

      expedidos.appendChild(card);

    }
    else {

      ativos.appendChild(card);

    }

  });


  renderResumoGeral();

};



// ------------------------------------------------
// RESUMO GERAL
// ------------------------------------------------
window.renderResumoGeral = function () {

  const totalLotes = state.lotes?.length || 0;

  const totalPosicoes = state.posicoes?.length || 0;

  const ocupadas = state.posicoes
    ?.filter(p => p.ocupada === true).length || 0;

  const livres = totalPosicoes - ocupadas;

  const ocupacao = totalPosicoes
    ? ((ocupadas / totalPosicoes) * 100).toFixed(1)
    : 0;


  document.getElementById("resumoLotes").textContent = totalLotes;

  document.getElementById("resumoAlocados").textContent = ocupadas;

  document.getElementById("resumoNaoAlocados").textContent = livres;

  document.getElementById("resumoExpedidos").textContent =
    state.historicoExpedidos
      ?.reduce((s, e) => s + (Number(e.quantidade) || 0), 0) || 0;

  document.getElementById("resumoSaldo").textContent = ocupacao + "%";

};



// ------------------------------------------------
// ALTERAR LOTE (COM REGRA)
// ------------------------------------------------
window.alterarLote = function (loteId) {

  const lote = state.lotes.find(l => String(l.id) === String(loteId));

  if (!lote) return;

  const alocados = contarAlocados(lote.id);

  const novoTotal = Number(
    prompt("Novo total do lote:", lote.volume_total)
  );

  if (!novoTotal) return;


  // 🔒 REGRA PRINCIPAL
  if (novoTotal < alocados) {

    alert(
      `Não é possível reduzir o lote.\n\n` +
      `Existem ${alocados} posições já alocadas no mapa.`
    );

    return;

  }


  lote.volume_total = novoTotal;


  if (typeof saveState === "function") {
    saveState();
  }

  renderDashboard();

};
