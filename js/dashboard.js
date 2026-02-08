// ===============================
// DASHBOARD.JS — FINAL E ESTÁVEL
// ===============================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

// ===============================
// LOTES ATIVOS
// ===============================
function renderLotesAtivos() {
  const div = document.getElementById('lotesAtivos');
  if (!div) return;

  div.innerHTML = '';

  state.lotes.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const expedidos = totalExpedidoDoLote(lote.nome);
    const naoAlocados = lote.total - alocados - expedidos;
    const saldo = lote.total - expedidos;

    // 🔴 Se saldo zerou, NÃO é mais ativo
    if (saldo <= 0) return;

    div.innerHTML += `
      <div class="lote-card">
        <h3>${lote.nome}</h3>

        <p><strong>Total:</strong> ${lote.total}</p>
        <p><strong>Alocados:</strong> ${alocados}</p>
        <p><strong>Não alocados:</strong> ${naoAlocados}</p>
        <p><strong>Expedidos:</strong> ${expedidos}</p>
        <p><strong>Saldo:</strong> ${saldo}</p>

        <div class="acoes">
          <button onclick="expedirLote('${lote.nome}')">
            Expedir
          </button>

          <button onclick="alterarQuantidadeLote('${lote.nome}')">
            Alterar Quantidade
          </button>

          <button class="danger" onclick="excluirLote('${lote.nome}')">
            Excluir
          </button>
        </div>
      </div>
    `;
  });

  if (div.innerHTML.trim() === '') {
    div.innerHTML = '<p>Nenhum lote ativo.</p>';
  }
}

// ===============================
// LOTES EXPEDIDOS
// ===============================
function renderLotesExpedidos() {
  const div = document.getElementById('lotesExpedidos');
  if (!div) return;

  div.innerHTML = '';

  const porLote = {};

  state.historicoExpedidos.forEach(h => {
    porLote[h.lote] ??= [];
    porLote[h.lote].push(h);
  });

  Object.entries(porLote).forEach(([nome, historico]) => {
    const lote = state.lotes.find(l => l.nome === nome);
    if (!lote) return;

    const total = lote.total;
    const expedidos = historico.reduce(
      (s, h) => s + h.detalhes.length,
      0
    );

    // 🔴 Só entra aqui se foi totalmente expedido
    if (expedidos < total) return;

    const ultima = historico.at(-1);

    div.innerHTML += `
      <div class="lote-card expedido">
        <h3>${nome}</h3>

        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Expedidos:</strong> ${expedidos}</p>
        <p><strong>Status:</strong> Completa</p>
        <p><strong>Data:</strong> ${ultima.data}</p>

        <div class="acoes">
          <button onclick="mostrarDetalhes('${nome}')">
            Detalhes
          </button>

          <button class="danger"
            onclick="excluirHistoricoLote('${nome}')">
            Excluir Histórico
          </button>
        </div>
      </div>
    `;
  });

  if (div.innerHTML.trim() === '') {
    div.innerHTML = '<p>Nenhum lote expedido.</p>';
  }
}
