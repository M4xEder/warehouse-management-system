// ===============================
// DASHBOARD.JS — ESTÁVEL
// ===============================

document.addEventListener("DOMContentLoaded", async () => {

  // Espera state carregar
  await aguardarState();

  renderLotesAtivos();

});

// ===============================
// AGUARDA STATE CARREGAR
// ===============================
async function aguardarState() {

  let tentativas = 0;

  while ((!window.state || !state.lotes || !state.posicoes) && tentativas < 20) {
    await new Promise(r => setTimeout(r, 200));
    tentativas++;
  }

  if (!state?.lotes) state.lotes = [];
  if (!state?.posicoes) state.posicoes = [];

}

// ===============================
// RENDER LOTES ATIVOS
// ===============================
window.renderLotesAtivos = function () {

  const container = document.getElementById("lotesAtivos");
  if (!container) return;

  container.innerHTML = "";

  if (!state || !Array.isArray(state.lotes)) {
    container.innerHTML = "<p>Nenhum lote carregado.</p>";
    return;
  }

  if (state.lotes.length === 0) {
    container.innerHTML = "<p>Sem lotes cadastrados.</p>";
    return;
  }

  state.lotes.forEach(lote => {

    const posicoesDoLote = state.posicoes.filter(p => p.lote_id === lote.id);
    const totalAlocado = posicoesDoLote.length;

    const totalExpedido = state.posicoes.filter(p =>
      p.expedido === true &&
      p.lote_original_id === lote.id
    ).length;

    const naoAlocado = lote.quantidade - totalAlocado - totalExpedido;
    const saldo = totalAlocado;

    let statusClass = "status-ativo";

    if (totalExpedido > 0 && saldo > 0) {
      statusClass = "status-parcial";
    }

    if (totalExpedido >= lote.quantidade && lote.quantidade > 0) {
      statusClass = "status-total";
    }

    const card = document.createElement("div");
    card.className = `lote-card ${statusClass}`;

    card.innerHTML = `
      <h3>${lote.nome}</h3>

      <p><strong>Total:</strong> ${lote.quantidade}</p>
      <p><strong>Alocados:</strong> ${totalAlocado}</p>
      <p><strong>Não Alocados:</strong> ${naoAlocado < 0 ? 0 : naoAlocado}</p>
      <p><strong>Expedidos:</strong> ${totalExpedido}</p>
      <p><strong>Saldo:</strong> ${saldo}</p>

      <div class="acoes">
        <button onclick="expedirLote('${lote.id}')">Expedir</button>
        <button onclick="alterarQuantidade('${lote.id}')">Alterar Qtd</button>
        <button class="danger" onclick="excluirLote('${lote.id}')">Excluir</button>
      </div>
    `;

    container.appendChild(card);

  });

};
