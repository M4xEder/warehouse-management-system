// ===============================
// DASHBOARD.JS — VERSÃO ESTÁVEL FINAL CORRIGIDA
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

    const total = Number(lote.quantidade ?? 0);

    // 🔥 CORREÇÃO REAL: usa lote.id
    const alocados = (state.posicoes || []).filter(p =>
      p.lote_id === lote.id &&
      p.ocupada === true &&
      p.rz &&
      p.volume
    ).length;

    const expedidos = (state.historicoExpedidos || []).filter(
      r => r.nome === lote.nome
    ).length;

    const saldo = Math.max(total - expedidos, 0);

    // Oculta apenas se totalmente expedido
    if (saldo <= 0) return;

    const naoAlocados = Math.max(total - alocados - expedidos, 0);

    exibiu = true;

    let statusTexto = expedidos > 0 ? 'Parcial' : 'Ativo';
    let classeStatus = expedidos > 0 ? 'status-parcial' : 'status-ativo';

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

  if (!Array.isArray(state.historicoExpedidos) ||
      state.historicoExpedidos.length === 0) {
    div.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  const porLote = {};

  state.historicoExpedidos.forEach(reg => {
    if (!reg.nome) return;
    porLote[reg.nome] ??= [];
    porLote[reg.nome].push(reg);
  });

  let exibiu = false;

  Object.entries(porLote).forEach(([nomeLote, registros]) => {

    const lote = state.lotes.find(l => l.nome === nomeLote);
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
        <h3>${nomeLote}</h3>

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
    div.innerHTML = '<p>Nenhum lote expedido.</p>';
  }
  }
