// ===============================
// DASHBOARD.JS — ATUALIZADO
// ===============================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

// -------------------------------
// LOTES ATIVOS
// -------------------------------
function renderLotesAtivos() {
  const div = document.getElementById('lotesAtivos');
  div.innerHTML = '';

  state.lotes
    .filter(l => l.ativo !== false)
    .forEach(l => {
      const alocados = contarGaylordsDoLote(l.nome);
      const expedidos = totalExpedidoDoLote(l.nome);
      const naoAlocados = l.total - alocados - expedidos;
      const saldo = l.total - expedidos;

      // Se foi totalmente expedido, não aparece mais
      if (saldo <= 0) return;

      div.innerHTML += `
        <div class="lote-card">
          <h3>${l.nome}</h3>
          <p>Total: ${l.total}</p>
          <p>Alocados: ${alocados}</p>
          <p>Não alocados: ${naoAlocados}</p>
          <p>Expedidos: ${expedidos}</p>
          <p>Saldo: ${saldo}</p>

          <button onclick="expedirLote('${l.nome}')">Expedir</button>
          <button onclick="alterarQuantidadeLote('${l.nome}')">Alterar</button>
          <button class="danger" onclick="excluirLote('${l.nome}')">Excluir</button>
        </div>
      `;
    });
}

// -------------------------------
// LOTES EXPEDIDOS
// -------------------------------
function renderLotesExpedidos() {
  const div = document.getElementById('lotesExpedidos');
  div.innerHTML = '';

  const porLote = {};

  state.historicoExpedidos.forEach(h => {
    porLote[h.lote] ??= [];
    porLote[h.lote].push(h);
  });

  Object.entries(porLote).forEach(([lote, historico]) => {
    const loteObj = state.lotes.find(l => l.nome === lote);
    const total = loteObj?.total || 0;

    const expedidos = historico.reduce(
      (s, h) => s + h.detalhes.length,
      0
    );

    const status = expedidos >= total
      ? 'Completa'
      : 'Parcial';

    const ultimaData = historico.at(-1)?.data || '-';

    div.innerHTML += `
      <div class="lote-card expedido">
        <h3>${lote}</h3>
        <p>Total: ${total}</p>
        <p>Quantidade expedida: ${expedidos}</p>
        <p>Status: ${status}</p>
        <p>Última expedição: ${ultimaData}</p>

        <button onclick="mostrarDetalhes('${lote}')">Detalhes</button>
        <button class="danger" onclick="excluirHistoricoLote('${lote}')">
          Excluir Histórico
        </button>
      </div>
    `;
  });
}

// -------------------------------
// DETALHES DO LOTE
// -------------------------------
window.mostrarDetalhes = function (lote) {
  const historico = state.historicoExpedidos.filter(
    h => h.lote === lote
  );

  if (!historico.length) {
    alert('Nenhum histórico encontrado');
    return;
  }

  const loteObj = state.lotes.find(l => l.nome === lote);
  const total = loteObj?.total || 0;

  const totalExpedido = historico.reduce(
    (s, h) => s + h.detalhes.length,
    0
  );

  let msg = '';

  if (totalExpedido >= total) {
    msg += `Lote ${lote}\n`;
    msg += `Expedido por completo em ${historico.at(-1).data}\n\n`;
  } else {
    msg += `Lote ${lote}\n`;
    msg += `Status: Expedição parcial\n`;
    msg += `Primeira expedição: ${historico[0].data}\n`;
    msg += `Última expedição: ${historico.at(-1).data}\n\n`;
  }

  historico.forEach((e) => {
    e.detalhes.forEach(d => {
      msg += `RZ: ${d.rz} | Volume: ${d.volume || '-'} | Data: ${e.data}\n`;
    });
  });

  alert(msg);
};

// -------------------------------
// EXCLUIR HISTÓRICO (SEM AFETAR MAPA)
// -------------------------------
window.excluirHistoricoLote = function (lote) {
  if (!confirm('Excluir apenas o histórico deste lote?')) return;

  state.historicoExpedidos =
    state.historicoExpedidos.filter(h => h.lote !== lote);

  saveState();
  renderDashboard();
};
