// =======================================
// DASHBOARD.JS — LOTES ATIVOS & EXPEDIDOS
// =======================================

window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

function renderLotesAtivos() {
  const container = document.getElementById('dashboard');
  if (!container) return;

  container.innerHTML = '';
  const ativos = state.lotes.filter(l => l.ativo !== false);
  if (!ativos.length) return container.innerHTML = '<p>Nenhum lote ativo.</p>';

  ativos.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const saldo = lote.total - lote.expedidos - alocados;

    const div = document.createElement('div');
    div.className = 'lote-card ativo';
    div.innerHTML = `
      <h3>${lote.nome}</h3>
      <p>Total: ${lote.total}</p>
      <p>Alocados: ${alocados}</p>
      <p>Expedidos: ${lote.expedidos}</p>
      <p>Saldo: ${saldo}</p>
      <div class="acoes">
        <button onclick="alterarQuantidadeLote('${lote.nome}')">Alterar Quantidade</button>
        <button onclick="expedirLote('${lote.nome}')">Expedir</button>
        <button class="danger" onclick="excluirLote('${lote.nome}')">Excluir</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderLotesExpedidos() {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';
  const expedidos = state.historicoExpedidos;
  if (!expedidos.length) return container.innerHTML = '<p>Nenhum lote expedido.</p>';

  expedidos.forEach(h => {
    const div = document.createElement('div');
    div.className = 'lote-card expedido';
    div.innerHTML = `
      <h3>${h.lote}</h3>
      <p>Quantidade Expedida: ${h.quantidadeExpedida}</p>
      <p>Data: ${h.data} ${h.hora}</p>
      <div class="acoes">
        <button onclick="alert(JSON.stringify(h.detalhes, null, 2))">Detalhes</button>
      </div>
    `;
    container.appendChild(div);
  });
}
