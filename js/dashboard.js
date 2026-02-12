// ===============================
// DASHBOARD.JS — PADRÃO PROFISSIONAL
// ===============================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};



// ===============================
// LOTES ATIVOS (SALDO > 0)
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

    const saldo = Math.max(total - expedidos, 0);
    const naoAlocados = Math.max(total - alocados - expedidos, 0);

    // 🔥 Só aparece aqui se ainda houver saldo
    if (saldo <= 0) return;

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
        <p><strong>Saldo:</strong> ${saldo}</p>

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
// LOTES EXPEDIDOS (PARCIAL + TOTAL)
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

  // 🔥 AGRUPAR POR LOTE
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

    const total = Number(lote.total) || 0;
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



// ===============================
// DETALHES
// ===============================
window.mostrarDetalhes = function (nomeLote) {

  const registros = state.historicoExpedidos.filter(
    r => r.nome === nomeLote
  );

  if (!registros.length) {
    alert('Nenhum histórico encontrado.');
    return;
  }

  const lote = state.lotes.find(l => l.nome === nomeLote);
  const total = Number(lote?.total) || 0;

  let msg = `Lote ${nomeLote}\n\n`;

  registros.forEach(r => {
    msg += `RZ: ${r.rz} | Volume: ${r.volume || '-'} | `;
    msg += `Área: ${r.area} | Rua: ${r.rua} | `;
    msg += `Data: ${r.data} ${r.hora}\n`;
  });

  msg += `\nTotal expedido: ${registros.length} / ${total}`;

  alert(msg);
};



// ===============================
// EXCLUIR HISTÓRICO
// ===============================
window.excluirHistoricoLote = function (nomeLote) {

  if (!confirm('Excluir apenas o histórico deste lote?')) return;

  state.historicoExpedidos =
    state.historicoExpedidos.filter(r => r.nome !== nomeLote);

  saveState();
  renderDashboard();
};
