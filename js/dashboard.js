// =====================================================
// DASHBOARD.JS — VERSÃO FINAL LIMPA E ESTÁVEL
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
  await aguardarState();
  renderDashboard();
});

// =====================================================
// AGUARDAR STATE CARREGAR
// =====================================================
async function aguardarState() {

  let tentativas = 0;

  while (
    (!window.state ||
      !Array.isArray(state.lotes) ||
      !Array.isArray(state.posicoes))
    && tentativas < 30
  ) {
    await new Promise(r => setTimeout(r, 200));
    tentativas++;
  }

  if (!state.lotes) state.lotes = [];
  if (!state.posicoes) state.posicoes = [];
}

// =====================================================
// RENDER PRINCIPAL
// =====================================================
window.renderDashboard = function () {
  renderResumoGeral();
  renderLotesAtivos();
  renderLotesExpedidos();
};

// =====================================================
// RESUMO GERAL
// =====================================================
function renderResumoGeral() {

  const totalLotes = state.lotes.length;

  const totalAlocados = state.posicoes.filter(p =>
    p.ocupada === true && p.expedido !== true
  ).length;

  const totalExpedidos = state.posicoes.filter(p =>
    p.expedido === true
  ).length;

  const totalQuantidade = state.lotes.reduce(
    (s, l) => s + (Number(l.quantidade) || 0),
    0
  );

  const totalNaoAlocados =
    totalQuantidade - totalAlocados - totalExpedidos;

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

// =====================================================
// LOTES ATIVOS
// =====================================================
window.renderLotesAtivos = function () {

  const container = document.getElementById("lotesAtivos");
  if (!container) return;

  container.innerHTML = "";

  if (!state.lotes.length) {
    container.innerHTML = "<p>Nenhum lote cadastrado.</p>";
    return;
  }

  state.lotes.forEach(lote => {

    const quantidade = Number(lote.quantidade) || 0;

    const totalAlocado = state.posicoes.filter(p =>
      String(p.lote_id) === String(lote.id) &&
      p.ocupada === true &&
      p.expedido !== true
    ).length;

    const totalExpedido = state.posicoes.filter(p =>
      p.expedido === true &&
      String(p.lote_original_id) === String(lote.id)
    ).length;

    const naoAlocado = quantidade - totalAlocado - totalExpedido;
    const saldo = totalAlocado;

    // 🔥 Não mostra lote totalmente expedido
    if (totalExpedido >= quantidade && quantidade > 0) {
      return;
    }

    let statusClass = "lote-ativo";
    if (totalExpedido > 0) statusClass = "lote-parcial";

    const card = document.createElement("div");
    card.className = `lote-card ${statusClass}`;

    card.innerHTML = `
      <h3>${lote.nome}</h3>

      <div class="resumo-lote">
        <p><strong>Total:</strong> ${quantidade}</p>
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

  renderResumoGeral();
};

// =====================================================
// LOTES EXPEDIDOS
// =====================================================
window.renderLotesExpedidos = function () {

  const container = document.getElementById("lotesExpedidos");
  if (!container) return;

  container.innerHTML = "";

  state.lotes.forEach(lote => {

    const quantidade = Number(lote.quantidade) || 0;

    const totalExpedido = state.posicoes.filter(p =>
      p.expedido === true &&
      String(p.lote_original_id) === String(lote.id)
    ).length;

    if (totalExpedido >= quantidade && quantidade > 0) {

      const card = document.createElement("div");
      card.className = "lote-card lote-total";

      card.innerHTML = `
        <h3>${lote.nome}</h3>
        <p><strong>Total:</strong> ${quantidade}</p>
        <p><strong>Expedidos:</strong> ${totalExpedido}</p>
      `;

      container.appendChild(card);
    }
  });
};
