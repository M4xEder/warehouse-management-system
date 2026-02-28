// ===============================
// DASHBOARD.JS — COMPATÍVEL COM SUPABASE
// ===============================

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderLotesAtivos === "function") {
    renderLotesAtivos();
  }
});

// ===============================
// RENDER LOTES ATIVOS
// ===============================
window.renderLotesAtivos = function () {

  const container = document.getElementById("lotesAtivos");
  if (!container) return;

  container.innerHTML = "";

  if (!state?.lotes) return;

  state.lotes.forEach(lote => {

    const totalAlocado = state.posicoes
      ?.filter(p => p.lote_id === lote.id)
      ?.length || 0;

    let statusClass = "status-ativo";

    if (totalAlocado > 0 && totalAlocado < lote.quantidade) {
      statusClass = "status-parcial";
    }

    if (totalAlocado >= lote.quantidade) {
      statusClass = "status-total";
    }

    const card = document.createElement("div");
    card.className = `lote-card ${statusClass}`;

    card.innerHTML = `
      <h3>${lote.nome}</h3>
      <p>Total: ${lote.quantidade}</p>
      <p>Alocado: ${totalAlocado}</p>

      <div class="acoes">
        <button onclick="expedirLote('${lote.id}')">
          Expedir
        </button>

        <button onclick="alterarQuantidade('${lote.id}')">
          Alterar Qtd
        </button>

        <button class="danger"
          onclick="excluirLote('${lote.id}')">
          Excluir
        </button>
      </div>
    `;

    container.appendChild(card);

  });

};

// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidade = async function (id) {

  const lote = state.lotes.find(l => l.id === id);
  if (!lote) return alert("Lote não encontrado.");

  const novaQtd = prompt("Nova quantidade:", lote.quantidade);
  if (!novaQtd) return;

  const { error } = await window.supabaseClient
    .from("lotes")
    .update({ quantidade: Number(novaQtd) })
    .eq("id", id);

  if (error) {
    alert("Erro ao atualizar quantidade");
    return;
  }

  lote.quantidade = Number(novaQtd);
  renderLotesAtivos();
};

// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = async function (id) {

  if (!confirm("Deseja excluir este lote?")) return;

  // Remove das posições
  const { error: erroPos } = await window.supabaseClient
    .from("posicoes")
    .update({ ocupada: false, lote_id: null })
    .eq("lote_id", id);

  if (erroPos) {
    alert("Erro ao limpar posições");
    return;
  }

  // Remove lote
  const { error } = await window.supabaseClient
    .from("lotes")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir lote");
    return;
  }

  state.lotes = state.lotes.filter(l => l.id !== id);
  state.posicoes.forEach(p => {
    if (p.lote_id === id) {
      p.lote_id = null;
      p.ocupada = false;
    }
  });

  renderLotesAtivos();

  if (typeof renderMapa === "function") {
    renderMapa();
  }
};

// ===============================
// EXPEDIR LOTE
// ===============================
window.expedirLote = async function (id) {

  const qtd = Number(prompt("Quantidade para expedir:"));
  if (!qtd || qtd <= 0) return;

  const posicoesDoLote = state.posicoes
    .filter(p => p.lote_id === id)
    .slice(0, qtd);

  if (posicoesDoLote.length === 0) {
    alert("Nenhuma posição encontrada.");
    return;
  }

  const ids = posicoesDoLote.map(p => p.id);

  const { error } = await window.supabaseClient
    .from("posicoes")
    .update({ ocupada: false, lote_id: null })
    .in("id", ids);

  if (error) {
    alert("Erro ao expedir.");
    return;
  }

  // Atualiza state local
  state.posicoes.forEach(p => {
    if (ids.includes(p.id)) {
      p.lote_id = null;
      p.ocupada = false;
    }
  });

  renderLotesAtivos();

  if (typeof renderMapa === "function") {
    renderMapa();
  }
};
// ===============================
// ATUALIZAR RESUMO GERAL
// ===============================
window.atualizarDashboard = function () {

  if (!state?.lotes || !state?.posicoes) return;

  const totalLotes = state.lotes.length;

  const totalAlocados = state.posicoes
    .filter(p => p.ocupada === true)
    .length;

  const totalNaoAlocados = state.posicoes
    .filter(p => p.ocupada === false)
    .length;

  // Expedidos = posições que tinham lote e foram liberadas
  const totalExpedidos = state.posicoes
    .filter(p => p.expedido === true)
    .length || 0;

  const saldo = totalAlocados - totalExpedidos;

  // Atualiza HTML
  const elLotes = document.getElementById("resumoLotes");
  const elAlocados = document.getElementById("resumoAlocados");
  const elNaoAlocados = document.getElementById("resumoNaoAlocados");
  const elExpedidos = document.getElementById("resumoExpedidos");
  const elSaldo = document.getElementById("resumoSaldo");

  if (elLotes) elLotes.textContent = totalLotes;
  if (elAlocados) elAlocados.textContent = totalAlocados;
  if (elNaoAlocados) elNaoAlocados.textContent = totalNaoAlocados;
  if (elExpedidos) elExpedidos.textContent = totalExpedidos;
  if (elSaldo) elSaldo.textContent = saldo;
};
