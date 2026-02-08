// ===============================
// DASHBOARD.JS
// ===============================
window.renderDashboard = function () {
  renderLotesAtivos();
  renderLotesExpedidos();
};

function renderLotesAtivos() {
  const div = document.getElementById('lotesAtivos');
  div.innerHTML = '';

  state.lotes.filter(l => l.ativo).forEach(l => {
    const alocados = contarGaylordsDoLote(l.nome);
    const expedidos = totalExpedidoDoLote(l.nome);
    const naoAlocados = l.total - alocados - expedidos;

    div.innerHTML += `
      <div class="lote-card">
        <h3>${l.nome}</h3>
        <p>Total: ${l.total}</p>
        <p>Alocados: ${alocados}</p>
        <p>Não alocados: ${naoAlocados}</p>
        <p>Expedidos: ${expedidos}</p>
        <p>Saldo: ${l.total - expedidos}</p>
        <button onclick="expedirLote('${l.nome}')">Expedir</button>
        <button onclick="alterarQuantidadeLote('${l.nome}')">Alterar</button>
      </div>
    `;
  });
}

function renderLotesExpedidos() {
  const div = document.getElementById('lotesExpedidos');
  div.innerHTML = '';

  const porLote = {};

  state.historicoExpedidos.forEach(h => {
    porLote[h.lote] ??= [];
    porLote[h.lote].push(h);
  });

  Object.entries(porLote).forEach(([lote, historico]) => {
    const total = state.lotes.find(l => l.nome === lote)?.total || 0;
    const qtd = historico.reduce((s, h) => s + h.detalhes.length, 0);
    const status = qtd === total ? 'Completa' : 'Parcial';

    div.innerHTML += `
      <div class="lote-card expedido">
        <h3>${lote}</h3>
        <p>Total: ${total}</p>
        <p>Expedidos: ${qtd}</p>
        <p>Status: ${status}</p>
        <p>Última: ${historico.at(-1).data}</p>
        <button onclick="mostrarDetalhes('${lote}')">Detalhes</button>
      </div>
    `;
  });
}

window.mostrarDetalhes = function (lote) {
  const h = state.historicoExpedidos.filter(e => e.lote === lote);
  let msg = `Lote ${lote}\n\n`;

  h.forEach((e, i) => {
    msg += `Expedição ${i + 1} - ${e.data}\n`;
    e.detalhes.forEach(d =>
      msg += `RZ:${d.rz} | Vol:${d.volume}\n`
    );
    msg += '\n';
  });

  alert(msg);
};
