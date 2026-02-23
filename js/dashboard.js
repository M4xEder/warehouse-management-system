// ===============================
// DASHBOARD.JS — VERSÃO FINAL CORRIGIDA
// ===============================

window.atualizarDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

window.renderDashboard = window.atualizarDashboard;



// ===============================
// LOTES ATIVOS (SALDO REAL)
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

    const alocados =
      typeof contarGaylordsDoLote === 'function'
        ? contarGaylordsDoLote(lote.nome)
        : 0;

    const expedidos =
      typeof totalExpedidoDoLote === 'function'
        ? totalExpedidoDoLote(lote.nome)
        : 0;

    // 🔥 SALDO REAL
    const saldo = total - expedidos;

    // 🔥 Só considera ativo se ainda houver saldo
    if (saldo <= 0) return;

    exibiu = true;

    const naoAlocados = Math.max(saldo - alocados, 0);

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
  const total = Number(lote?.quantidade ?? 0);

  let msg = `📦 LOTE: ${nomeLote}\n`;
  msg += `--------------------------------------\n\n`;

  registros.forEach((r, i) => {
    msg += `#${i + 1}\n`;
    msg += `RZ: ${r.rz}\n`;
    msg += `Volume: ${r.volume || '-'}\n`;
    msg += `Área: ${r.area}\n`;
    msg += `Rua: ${r.rua}\n`;
    msg += `Data: ${r.data} ${r.hora}\n`;
    msg += `--------------------------------------\n`;
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

  renderDashboard();
};
