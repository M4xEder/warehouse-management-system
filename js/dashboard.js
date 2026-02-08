// ===============================
// DASHBOARD.JS — FINAL, ESTÁVEL E BLINDADO
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

  if (!Array.isArray(state.lotes) || state.lotes.length === 0) {
    div.innerHTML = '<p>Nenhum lote cadastrado.</p>';
    return;
  }

  let exibiu = false;

  state.lotes.forEach(lote => {
    const total = Number(lote.total) || 0;

    const alocados =
      typeof contarGaylordsDoLote === 'function'
        ? contarGaylordsDoLote(lote.nome)
        : 0;

    const expedidos =
      typeof totalExpedidoDoLote === 'function'
        ? totalExpedidoDoLote(lote.nome)
        : 0;

    const naoAlocados = Math.max(total - alocados - expedidos, 0);
    const saldo = Math.max(total - expedidos, 0);

    // 🔴 Totalmente expedido → não é mais ativo
    if (saldo <= 0) return;

    exibiu = true;

    div.innerHTML += `
      <div class="lote-card">
        <h3>${lote.nome}</h3>

        <p><strong>Total:</strong> ${total}</p>
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

          <button class="danger"
            onclick="excluirLote('${lote.nome}')">
            Excluir
          </button>
        </div>
      </div>
    `;
  });

  if (!exibiu) {
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

  if (
    !Array.isArray(state.historicoExpedidos) ||
    state.historicoExpedidos.length === 0
  ) {
    div.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  const porLote = {};

  state.historicoExpedidos.forEach(h => {
    if (!h || !h.lote || !Array.isArray(h.detalhes)) return;
    porLote[h.lote] ??= [];
    porLote[h.lote].push(h);
  });

  let exibiu = false;

  Object.entries(porLote).forEach(([nomeLote, historico]) => {
    const lote = state.lotes.find(l => l.nome === nomeLote);
    if (!lote) return;

    const total = Number(lote.total) || 0;

    const expedidos = historico.reduce(
      (s, h) => s + (Array.isArray(h.detalhes) ? h.detalhes.length : 0),
      0
    );

    // 🔴 Só aparece aqui se estiver 100% expedido
    if (expedidos < total) return;

    exibiu = true;

    const ultima = historico.at(-1);

    div.innerHTML += `
      <div class="lote-card expedido">
        <h3>${nomeLote}</h3>

        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Expedidos:</strong> ${expedidos}</p>
        <p><strong>Status:</strong> Completa</p>
        <p><strong>Data:</strong> ${ultima?.data || '-'}</p>

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

  if (!exibiu) {
    div.innerHTML = '<p>Nenhum lote totalmente expedido.</p>';
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
    alert('Nenhum histórico encontrado.');
    return;
  }

  const lote = state.lotes.find(l => l.nome === nomeLote);
  const total = Number(lote?.total) || 0;

  const totalExpedido = historico.reduce(
    (s, h) => s + (Array.isArray(h.detalhes) ? h.detalhes.length : 0),
    0
  );

  let msg = `Lote ${nomeLote}\n\n`;

  if (totalExpedido >= total) {
    msg += `Expedido por completo em ${historico.at(-1).data}\n\n`;
  } else {
    msg += `Expedição parcial\n`;
    msg += `Primeira: ${historico[0].data}\n`;
    msg += `Última: ${historico.at(-1).data}\n\n`;
  }

  historico.forEach(e => {
    e.detalhes.forEach(d => {
      msg += `RZ: ${d.rz} | Volume: ${d.volume || '-'} | Data: ${e.data}\n`;
    });
  });

  alert(msg);
};

// ===============================
// EXCLUIR HISTÓRICO (SEM AFETAR MAPA)
// ===============================
window.excluirHistoricoLote = function (nomeLote) {
  if (!confirm('Excluir apenas o histórico deste lote?')) return;

  state.historicoExpedidos =
    state.historicoExpedidos.filter(h => h.lote !== nomeLote);

  saveState();
  renderDashboard();
};
