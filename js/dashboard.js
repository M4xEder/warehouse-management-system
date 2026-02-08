// ===============================
// DASHBOARD.JS — FINAL ESTÁVEL
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

    // 🔴 Se saldo acabou, não é mais ativo
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
// LOTES EXPEDIDOS (COMPLETOS)
// ===============================
function renderLotesExpedidos() {
  const div = document.getElementById('lotesExpedidos');
  if (!div) return;

  div.innerHTML = '';

  const historicoPorLote = {};

  state.historicoExpedidos.forEach(h => {
    historicoPorLote[h.lote] ??= [];
    historicoPorLote[h.lote].push(h);
  });

  Object.entries(historicoPorLote).forEach(([nomeLote, historico]) => {
    const lote = state.lotes.find(l => l.nome === nomeLote);
    if (!lote) return;

    const total = lote.total;
    const expedidos = historico.reduce(
      (s, h) => s + h.detalhes.length,
      0
    );

    // 🔴 Só mostra se foi totalmente expedido
    if (expedidos < total) return;

    const ultimaExpedicao = historico.at(-1);

    div.innerHTML += `
      <div class="lote-card expedido">
        <h3>${nomeLote}</h3>

        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Quantidade expedida:</strong> ${expedidos}</p>
        <p><strong>Status:</strong> Completa</p>
        <p><strong>Data da expedição:</strong> ${ultimaExpedicao.data}</p>

        <div class="acoes">
          <button onclick="mostrarDetalhes('${nomeLote}')">
            Detalhes
          </button>

          <button class="danger"
            onclick="excluirHistoricoLote('${nomeLote}')">
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

// ===============================
// DETALHES DO HISTÓRICO
// ===============================
window.mostrarDetalhes = function (nomeLote) {
  const historico = state.historicoExpedidos.filter(
    h => h.lote === nomeLote
  );

  if (!historico.length) {
    alert('Nenhum histórico encontrado');
    return;
  }

  const lote = state.lotes.find(l => l.nome === nomeLote);
  const total = lote?.total || 0;

  const totalExpedido = historico.reduce(
    (s, h) => s + h.detalhes.length,
    0
  );

  let msg = `Lote: ${nomeLote}\n\n`;

  if (totalExpedido >= total) {
    msg += `Status: Expedido por completo\n`;
    msg += `Data final: ${historico.at(-1).data}\n\n`;
  } else {
    msg += `Status: Expedição parcial\n`;
    msg += `Primeira expedição: ${historico[0].data}\n`;
    msg += `Última expedição: ${historico.at(-1).data}\n\n`;
  }

  historico.forEach((exp, i) => {
    msg += `Expedição ${i + 1} — ${exp.data}\n`;
    exp.detalhes.forEach(d => {
      msg += `RZ: ${d.rz} | Volume: ${d.volume || '-'}\n`;
    });
    msg += '\n';
  });

  alert(msg);
};

// ===============================
// EXCLUIR HISTÓRICO (SEM MAPA)
// ===============================
window.excluirHistoricoLote = function (nomeLote) {
  if (!confirm('Excluir apenas o histórico deste lote?')) return;

  state.historicoExpedidos =
    state.historicoExpedidos.filter(h => h.lote !== nomeLote);

  saveState();
  renderDashboard();
};
