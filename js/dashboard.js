// ===============================
// DASHBOARD.JS — VERSÃO DEFINITIVA CORRIGIDA
// ===============================

window.atualizarDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

window.renderDashboard = window.atualizarDashboard;


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

    const total = Number(lote.quantidade ?? 0); // 🔒 TOTAL NUNCA MUDA

    const alocados = (state.posicoes || []).filter(p =>
      p.lote_id === lote.id &&
      p.ocupada === true
    ).length;

    const expedidos = (state.historicoExpedidos || []).filter(r =>
      r.lote_id === lote.id
    ).length;

    const naoAlocados = Math.max(total - alocados - expedidos, 0);

    const saldo = Math.max(total - expedidos, 0);

    // Se totalmente expedido, não mostra como ativo
    if (saldo <= 0) return;

    exibiu = true;

    let statusTexto = 'Ativo';
    let classeStatus = 'status-ativo';

    if (expedidos > 0 && saldo > 0) {
      statusTexto = 'Parcial';
      classeStatus = 'status-parcial';
    }

    div.innerHTML += `
      <div class="lote-card">
        <h3>${lote.nome}</h3>

        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Alocados:</strong> ${alocados}</p>
        <p><strong>Não alocados:</strong> ${naoAlocados}</p>
        <p><strong>Expedidos:</strong> ${expedidos}</p>
        <p><strong>Saldo disponível:</strong> ${saldo}</p>

        <p>
          <strong>Status:</strong>
          <span class="${classeStatus}">
            ${statusTexto}
          </span>
        </p>

        <div class="acoes">
          <button onclick="expedirLote('${lote.id}')">
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

  if (!Array.isArray(state.historicoExpedidos) ||
      state.historicoExpedidos.length === 0) {
    div.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  const porLote = {};

  state.historicoExpedidos.forEach(reg => {
    if (!reg.lote_id) return;
    porLote[reg.lote_id] ??= [];
    porLote[reg.lote_id].push(reg);
  });

  let exibiu = false;

  Object.entries(porLote).forEach(([loteId, registros]) => {

    const lote = state.lotes.find(l => l.id === loteId);
    if (!lote) return;

    const total = Number(lote.quantidade ?? 0);
    const totalExpedido = registros.length;

    if (totalExpedido <= 0) return;

    exibiu = true;

    const ultima = registros.at(-1);

    let statusTexto = '';
    let classeStatus = '';

    if (totalExpedido < total) {
      statusTexto = 'Parcial';
      classeStatus = 'status-parcial';
    } else {
      statusTexto = 'Expedido Total';
      classeStatus = 'status-total';
    }

    div.innerHTML += `
      <div class="lote-card expedido">
        <h3>${lote.nome}</h3>

        <p><strong>Total:</strong> ${total}</p>
        <p><strong>Expedidos:</strong> ${totalExpedido}</p>

        <p>
          <strong>Status:</strong>
          <span class="${classeStatus}">
            ${statusTexto}
          </span>
        </p>

        <p><strong>Última expedição:</strong> 
          ${ultima?.data || '-'} ${ultima?.hora || ''}
        </p>

        <div class="acoes">
          <button onclick="mostrarDetalhes('${lote.id}')">
            Detalhes
          </button>

          <button class="danger"
            onclick="excluirHistoricoLote('${lote.id}')">
            Excluir Histórico
          </button>
        </div>
      </div>
    `;
  });

  if (!exibiu) {
    div.innerHTML = '<p>Nenhum lote expedido.</p>';
  }
}
