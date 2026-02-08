// =======================================
// DASHBOARD.JS — Lotes Ativos e Expedidos
// =======================================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

// ===============================
// LOTES ATIVOS
// ===============================
function renderLotesAtivos() {
  const container = document.getElementById('lotesAtivos');
  if (!container) return;

  container.innerHTML = '';

  const ativos = state.lotes.filter(l => l.ativo);

  if (ativos.length === 0) {
    container.innerHTML = '<p>Nenhum lote ativo.</p>';
    return;
  }

  ativos.forEach(lote => {
    const alocados = state.areas.reduce((acc, area) =>
      acc + area.ruas.reduce((ra, rua) =>
        ra + rua.posicoes.filter(p => p.ocupada && p.lote === lote.nome).length,0
      ),0
    );
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
        <button onclick="abrirAlterarQuantidade('${lote.nome}')">Alterar Quantidade</button>
        <button onclick="expedirLote('${lote.nome}')">Expedir</button>
        <button class="danger" onclick="excluirLote('${lote.nome}')">Excluir</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ===============================
// LOTES EXPEDIDOS
// ===============================
function renderLotesExpedidos() {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  const expedidos = state.lotes.filter(l => !l.ativo);

  if (expedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  expedidos.forEach(lote => {
    const div = document.createElement('div');
    div.className = 'lote-card expedido';
    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p><strong>Total:</strong> ${lote.total}</p>
      <p><strong>Expedidos:</strong> ${lote.expedidos || lote.total}</p>
      <div class="acoes">
        <button onclick="detalhesExpedicao('${lote.nome}')">Detalhes</button>
        <button class="danger" onclick="excluirLote('${lote.nome}')">Excluir</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// ===============================
// ABRIR ALTERAR QUANTIDADE
// ===============================
window.abrirAlterarQuantidade = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const novoTotal = Number(prompt(`Informe o novo total de gaylords para "${nomeLote}":`, lote.total));
  if (!novoTotal || novoTotal <= 0) { alert('Quantidade inválida'); return; }

  lote.total = novoTotal;
  saveState();
  renderDashboard();
};

// ===============================
// DETALHES EXPEDIÇÃO
// ===============================
window.detalhesExpedicao = function (nomeLote) {
  const historico = state.historicoExpedidos.filter(h => h.lote === nomeLote);
  if (!historico || historico.length === 0) { alert('Nenhuma expedição para este lote'); return; }

  let msg = `Lote: ${nomeLote}\n\n`;
  historico.forEach((h, i) => {
    msg += `#${i+1} - Data: ${h.data} Hora: ${h.hora}\n`;
    h.detalhes.forEach(d => {
      msg += `  Área: ${d.area} | Rua: ${d.rua} | Pos: ${d.posicao} | RZ: ${d.rz} | Vol: ${d.volume}\n`;
    });
    msg += '\n';
  });

  alert(msg);
};
