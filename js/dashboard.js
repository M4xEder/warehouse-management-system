// =======================================
// DASHBOARD.JS
// Lotes Ativos e Lotes Expedidos
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
    const saldo = lote.total - expedidos - alocados;

    const div = document.createElement('div');
    div.className = 'lote-card ativo';

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

    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p><strong>Total:</strong> ${total}</p>
      <p><strong>Expedidos:</strong> ${totalExpedidos}</p>
      <p><strong>Status:</strong> ${
        parcial ? 'Expedição Parcial' : 'Expedição Completa'
      }</p>
      <p><strong>Data:</strong> ${
        lote.dataExpedicao || '-'
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

// =======================================
// EXCLUIR LOTE (ATIVO OU EXPEDIDO)
// =======================================
window.excluirLote = function (nomeLote) {
  const index = state.lotes.findIndex(l => l.nome === nomeLote);
  if (index === -1) return;

  if (!confirm(`Excluir o lote "${nomeLote}"?`)) return;

  state.lotes.splice(index, 1);
  saveState();
  renderDashboard();
  renderMapa();
};

// =======================================
// ALTERAR QUANTIDADE
// =======================================
window.abrirAlterarQuantidade = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const novoTotal = prompt(
    `Informe o novo total de gaylords para o lote "${nomeLote}":`,
    lote.total
  );

  const valor = Number(novoTotal);
  if (!valor || valor <= 0) {
    alert('Quantidade inválida');
    return;
  }

  lote.total = valor;
  saveState();

  renderDashboard();
};

// =======================================
// DETALHES DA EXPEDIÇÃO
// =======================================
window.detalhesExpedicao = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  let msg = `Lote: ${lote.nome}\n`;
  msg += `Total: ${lote.total}\n`;
  msg += `Expedidos: ${lote.expedidos || 0}\n\n`;

  if (Array.isArray(lote.historico)) {
    msg += `Expedições anteriores: ${lote.historico.length}\n\n`;

    lote.historico.forEach((h, i) => {
      msg += `#${i + 1} - ${h.data}\n`;
      h.gaylords.forEach(g => {
        msg += `  RZ: ${g.rz} | Volume: ${g.volume || '-'}\n`;
      });
      msg += '\n';
    });
  }

  alert(msg);
};
