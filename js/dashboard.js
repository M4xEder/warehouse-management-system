// ===============================
// DASHBOARD.JS — VERSÃO FINAL ESTÁVEL
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderLotesAtivos === "function") {
    renderLotesAtivos();
  }

  if (typeof atualizarDashboard === "function") {
    atualizarDashboard();
  }
});

// ===============================
// RENDER LOTES ATIVOS
// ===============================
window.renderLotesAtivos = function () {

  const container = document.getElementById("lotesAtivos");
  if (!container) return;

  container.innerHTML = "";

  if (!state || !state.lotes || !state.posicoes) return;

  state.lotes.forEach(lote => {

    const posicoesDoLote = state.posicoes.filter(p => p.lote_id === lote.id);

    const alocados = posicoesDoLote.length;
    const expedidos = posicoesDoLote.filter(p => p.expedido === true).length;
    const naoAlocados = lote.quantidade - alocados;
    const saldo = alocados - expedidos;

    // ===============================
    // STATUS VISUAL
    // ===============================
    let statusClass = "status-ativo";

    if (alocados > 0 && saldo > 0 && alocados < lote.quantidade) {
      statusClass = "status-parcial";
    }

    if (saldo === 0 && alocados >= lote.quantidade) {
      statusClass = "status-total";
    }

    const card = document.createElement("div");
    card.className = `lote-card ${statusClass}`;

    card.innerHTML = `
      <h3>${lote.nome}</h3>

      <p><strong>Total:</strong> ${lote.quantidade}</p>
      <p><strong>Alocados:</strong> ${alocados}</p>
      <p><strong>Não Alocados:</strong> ${naoAlocados < 0 ? 0 : naoAlocados}</p>
      <p><strong>Expedidos:</strong> ${expedidos}</p>
      <p><strong>Saldo:</strong> ${saldo < 0 ? 0 : saldo}</p>

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
  if (!novaQtd || isNaN(novaQtd)) return;

  if (Number(novaQtd) < 0) {
    alert("Quantidade inválida.");
    return;
  }

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
  atualizarDashboard();
};

// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = async function (id) {

  if (!confirm("Deseja excluir este lote?")) return;

  // Limpa posições
  const { error: erroPos } = await window.supabaseClient
    .from("posicoes")
    .update({ ocupada: false, lote_id: null, expedido: false })
    .eq("lote_id", id);

  if (erroPos) {
    alert("Erro ao limpar posições");
    return;
  }

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
      p.expedido = false;
    }
  });

  renderLotesAtivos();
  atualizarDashboard();

  if (typeof renderMapa === "function") {
    renderMapa();
  }
};

// ===============================
// EXPEDIR LOTE (CORRIGIDO)
// ===============================
window.expedirLote = async function (id) {

  const lote = state.lotes.find(l => l.id === id);
  if (!lote) return alert("Lote não encontrado.");

  const posicoesDoLote = state.posicoes.filter(p => p.lote_id === id);

  if (posicoesDoLote.length === 0) {
    alert("Nenhuma posição alocada.");
    return;
  }

  const qtd = Number(prompt(`Quantidade para expedir (máx ${posicoesDoLote.length}):`));
  if (!qtd || qtd <= 0) return;

  const selecionadas = posicoesDoLote.slice(0, qtd);
  const ids = selecionadas.map(p => p.id);

  const { error } = await window.supabaseClient
    .from("posicoes")
    .update({
      ocupada: false,
      lote_id: null,
      expedido: true
    })
    .in("id", ids);

  if (error) {
    alert("Erro ao expedir.");
    return;
  }

  state.posicoes.forEach(p => {
    if (ids.includes(p.id)) {
      p.lote_id = null;
      p.ocupada = false;
      p.expedido = true;
    }
  });

  renderLotesAtivos();
  atualizarDashboard();

  if (typeof renderMapa === "function") {
    renderMapa();
  }
};

// ===============================
// RESUMO GERAL DO DASHBOARD
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

  const totalExpedidos = state.posicoes
    .filter(p => p.expedido === true)
    .length;

  const saldo = totalAlocados - totalExpedidos;

  const elLotes = document.getElementById("resumoLotes");
  const elAlocados = document.getElementById("resumoAlocados");
  const elNaoAlocados = document.getElementById("resumoNaoAlocados");
  const elExpedidos = document.getElementById("resumoExpedidos");
  const elSaldo = document.getElementById("resumoSaldo");

  if (elLotes) elLotes.textContent = totalLotes;
  if (elAlocados) elAlocados.textContent = totalAlocados;
  if (elNaoAlocados) elNaoAlocados.textContent = totalNaoAlocados;
  if (elExpedidos) elExpedidos.textContent = totalExpedidos;
  if (elSaldo) elSaldo.textContent = saldo < 0 ? 0 : saldo;
};
