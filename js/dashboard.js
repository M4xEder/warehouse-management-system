// =======================================
// DASHBOARD.JS — Lotes Ativos e Lotes Expedidos
// =======================================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

// =======================================
// LOTES ATIVOS
// =======================================
function renderLotesAtivos() {
  const container = document.getElementById('dashboard');
  if (!container) return;

  container.innerHTML = '';

  const ativos = state.lotes.filter(l => l.ativo !== false);

  if (ativos.length === 0) {
    container.innerHTML = '<p>Nenhum lote ativo.</p>';
    return;
  }

  ativos.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const expedidos = totalExpedidoDoLote(lote.nome);
    const saldo = lote.total - alocados - expedidos;

    const div = document.createElement('div');
    div.className = 'lote-card ativo';

    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p><strong>Total:</strong> ${lote.total}</p>
      <p><strong>Alocados:</strong> ${alocados}</p>
      <p><strong>Expedidos:</strong> ${expedidos}</p>
      <p><strong>Saldo:</strong> ${saldo}</p>

      <div class="acoes">
        <button onclick="abrirAlterarQuantidade('${lote.nome}')">Alterar Quantidade</button>
        <button onclick="expedirLote('${lote.nome}')">Expedir</button>
        <button class="danger" onclick="excluirLote('${lote.nome}')">Excluir</button>
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

  // Pegando lotes que possuem expedição no histórico
  const lotesComHistorico = state.lotes.filter(l =>
    totalExpedidoDoLote(l.nome) > 0
  );

  if (lotesComHistorico.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  lotesComHistorico.forEach(lote => {
    const total = lote.total;
    const expedidos = totalExpedidoDoLote(lote.nome);
    const parcial = expedidos < total;

    // Pegando a última data do histórico do lote
    const historico = state.historicoExpedidos.filter(h => h.lote === lote.nome);
    const ultimaData = historico.length > 0 ? historico[historico.length - 1].data : '-';

    const div = document.createElement('div');
    div.className = 'lote-card expedido';

    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p><strong>Total:</strong> ${total}</p>
      <p><strong>Expedidos:</strong> ${expedidos}</p>
      <p><strong>Status:</strong> ${parcial ? 'Expedição Parcial' : 'Expedição Completa'}</p>
      <p><strong>Última Expedição:</strong> ${ultimaData}</p>

      <div class="acoes">
        <button onclick="detalhesExpedicao('${lote.nome}')">Detalhes</button>
        <button class="danger" onclick="excluirLote('${lote.nome}')">Excluir</button>
      </div>
    `;

    container.appendChild(div);
  });
}

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

  const alocados = contarGaylordsDoLote(lote.nome);
  const expedidos = totalExpedidoDoLote(lote.nome);
  const minimo = alocados + expedidos;

  if (valor < minimo) {
    alert(
      `Quantidade inválida.\nMínimo permitido: ${minimo}\n(Alocados: ${alocados} | Expedidos: ${expedidos})`
    );
    return;
  }

  lote.total = valor;
  lote.ativo = true;

  saveState();
  renderDashboard();
  renderMapa();
};

// =======================================
// EXCLUIR LOTE
// =======================================
window.excluirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocados = contarGaylordsDoLote(lote.nome);
  const temHistorico = state.historicoExpedidos.some(h => h.lote === lote.nome);

  if (alocados > 0) {
    alert(`Não é possível excluir o lote. Existem ${alocados} gaylords alocadas.`);
    return;
  }

  if (temHistorico) {
    alert('Não é possível excluir o lote. Este lote possui histórico de expedição.');
    return;
  }

  if (!confirm(`Excluir definitivamente o lote "${lote.nome}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== lote.nome);

  saveState();
  renderDashboard();
  renderMapa();
};

// =======================================
// DETALHES DA EXPEDIÇÃO
// =======================================
window.detalhesExpedicao = function (nomeLote) {
  const historico = state.historicoExpedidos.filter(h => h.lote === nomeLote);
  if (!historico || historico.length === 0) {
    alert('Nenhum histórico de expedição encontrado.');
    return;
  }

  let msg = `Lote: ${nomeLote}\n`;
  msg += `Total do Lote: ${state.lotes.find(l => l.nome === nomeLote).total}\n`;
  msg += `Número de expedições: ${historico.length}\n\n`;

  historico.forEach((h, i) => {
    msg += `#${i + 1} - ${h.data} ${h.hora}\n`;
    h.detalhes.forEach(d => {
      msg += `  Área: ${d.area} | Rua: ${d.rua} | Pos: ${d.posicao} | RZ: ${d.rz} | Vol: ${d.volume}\n`;
    });
    msg += '\n';
  });

  alert(msg);
};
