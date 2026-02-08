// =======================================
// DASHBOARD.JS — Lotes Ativos e Expedidos
// =======================================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

// =======================================
// LOTES ATIVOS
// =======================================
function renderLotesAtivos() {
  const container = document.getElementById('lotesAtivos');
  if (!container) return;

  container.innerHTML = '';

  const ativos = state.lotes.filter(l => l.ativo !== false);

  if (ativos.length === 0) {
    container.innerHTML = '<p>Nenhum lote ativo.</p>';
    return;
  }

  ativos.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const expedidos = lote.expedidos || 0;
    const saldo = lote.total - alocados - expedidos;

    const div = document.createElement('div');
    div.className = 'lote-card ativo';
    div.style.borderLeft = `6px solid ${lote.cor}`;

    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p><strong>Total:</strong> ${lote.total}</p>
      <p><strong>Alocados:</strong> ${alocados}</p>
      <p><strong>Expedidos:</strong> ${expedidos}</p>
      <p><strong>Saldo:</strong> ${saldo}</p>

      <div class="acoes">
        <button onclick="abrirAlterarQuantidade('${lote.nome}')">
          Alterar Quantidade
        </button>

        <button onclick="expedirLote('${lote.nome}')">
          Expedir
        </button>

        <button class="danger" onclick="excluirLote('${lote.nome}')">
          Excluir
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}

// =======================================
// LOTES EXPEDIDOS
// =======================================
function renderLotesExpedidos() {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  const expedidos = state.lotes.filter(l => l.ativo === false);

  if (expedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  expedidos.forEach(lote => {
    const total = lote.total;
    const totalExpedidos = lote.expedidos || total;
    const parcial = totalExpedidos < total;

    const div = document.createElement('div');
    div.className = 'lote-card expedido';
    div.style.borderLeft = `6px solid ${lote.cor}`;

    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p><strong>Total:</strong> ${total}</p>
      <p><strong>Expedidos:</strong> ${totalExpedidos}</p>
      <p><strong>Status:</strong> ${
        parcial ? 'Expedição Parcial' : 'Expedição Completa'
      }</p>

      <div class="acoes">
        <button onclick="detalhesExpedicao('${lote.nome}')">
          Detalhes
        </button>

        <button class="danger" onclick="excluirLote('${lote.nome}')">
          Excluir
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}
