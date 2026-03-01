// ===============================
// DASHBOARD.JS — COMPLETO
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  await aguardarState();
  renderDashboard();
});

// ===============================
// AGUARDAR STATE
// ===============================
async function aguardarState() {

  let tentativas = 0;

  while (
    (!window.state || !Array.isArray(state.lotes) || !Array.isArray(state.posicoes))
    && tentativas < 20
  ) {
    await new Promise(r => setTimeout(r, 200));
    tentativas++;
  }

  if (!state.lotes) state.lotes = [];
  if (!state.posicoes) state.posicoes = [];
}

// ===============================
// RENDER PRINCIPAL
// ===============================
window.renderDashboard = function () {
  renderResumoGeral();
  renderLotesAtivos();
  renderLotesExpedidos();
};

// ===============================
// RESUMO GERAL (cards do topo)
// ===============================
function renderResumoGeral() {

  const totalLotes = state.lotes.length;

  const totalAlocados = state.posicoes.filter(p => !p.expedido).length;

  const totalExpedidos = state.posicoes.filter(p => p.expedido === true).length;

  const totalQuantidade = state.lotes.reduce((s, l) => s + (l.quantidade || 0), 0);

  const totalNaoAlocados = totalQuantidade - totalAlocados - totalExpedidos;

  const totalSaldo = totalAlocados;

  setText("resumoLotes", totalLotes);
  setText("resumoAlocados", totalAlocados);
  setText("resumoNaoAlocados", totalNaoAlocados < 0 ? 0 : totalNaoAlocados);
  setText("resumoExpedidos", totalExpedidos);
  setText("resumoSaldo", totalSaldo);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ===============================
// LOTES ATIVOS
// ===============================
window.renderLotesAtivos = function () {

  const container = document.getElementById("lotesAtivos");
  if (!container) return;

  container.innerHTML = "";

  if (!state.lotes.length) {
    container.innerHTML = "<p>Nenhum lote cadastrado.</p>";
    return;
  }

  state.lotes.forEach(lote => {

    const posicoesDoLote = state.posicoes.filter(p => p.lote_id === lote.id && !p.expedido);
    const totalAlocado = posicoesDoLote.length;

    const totalExpedido = state.posicoes.filter(p =>
      p.expedido === true &&
      p.lote_original_id === lote.id
    ).length;

    const naoAlocado = lote.quantidade - totalAlocado - totalExpedido;
    const saldo = totalAlocado;

    // Se totalmente expedido → não aparece em ativos
    if (totalExpedido >= lote.quantidade && lote.quantidade > 0) {
      return;
    }

    let statusClass = "lote-ativo";

    if (totalExpedido > 0) {
      statusClass = "lote-parcial";
    }

    const card = document.createElement("div");
    card.className = `lote-card ${statusClass}`;

    card.innerHTML = `
      <h3>${lote.nome}</h3>

      <div class="resumo-lote">
        <p><strong>Total:</strong> ${lote.quantidade}</p>
        <p><strong>Alocados:</strong> ${totalAlocado}</p>
        <p><strong>Não Alocados:</strong> ${naoAlocado < 0 ? 0 : naoAlocado}</p>
        <p><strong>Expedidos:</strong> ${totalExpedido}</p>
        <p><strong>Saldo:</strong> ${saldo}</p>
      </div>

      <div class="acoes">
        <button onclick="expedirLote('${lote.id}')">Expedir</button>
        <button onclick="alterarQuantidade('${lote.id}')">Alterar</button>
        <button onclick="excluirLote('${lote.id}')">Excluir</button>
      </div>
    `;

    container.appendChild(card);
  });

};

// ===============================
// LOTES EXPEDIDOS
// ===============================
window.renderLotesExpedidos = function () {

  const container = document.getElementById("lotesExpedidos");
  if (!container) return;

  container.innerHTML = "";

  state.lotes.forEach(lote => {

    const totalExpedido = state.posicoes.filter(p =>
      p.expedido === true &&
      p.lote_original_id === lote.id
    ).length;

    if (totalExpedido >= lote.quantidade && lote.quantidade > 0) {

      const card = document.createElement("div");
      card.className = "lote-card lote-total";

      card.innerHTML = `
        <h3>${lote.nome}</h3>
        <p><strong>Total:</strong> ${lote.quantidade}</p>
        <p><strong>Expedidos:</strong> ${totalExpedido}</p>
      `;

      container.appendChild(card);
    }

  });

};
