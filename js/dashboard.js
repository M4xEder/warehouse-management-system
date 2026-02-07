// ===============================
// DASHBOARD.JS
// ===============================

window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) total++;
      });
    });
  });

  return total;
};

window.contarExpedidasDoLote = function (nomeLote) {
  let total = 0;
  state.historicoExpedidos.forEach(e => {
    if (e.lote === nomeLote) total += e.quantidadeExpedida;
  });
  return total;
};

window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  state.lotes.forEach(lote => {
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarExpedidasDoLote(lote.nome);
    const saldo = lote.total - expedidas;

    if (saldo <= 0) return;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong>
      <div>Total: ${lote.total}</div>
      <div>Alocadas: ${alocadas}</div>
      <div>Expedidas: ${expedidas}</div>
      <div>Saldo: ${saldo}</div>

      <button onclick="expedirLote('${lote.nome}')">Expedir</button>
      <button onclick="alterarQuantidadeLote('${lote.nome}')">Alterar quantidade</button>
      <button class="danger" onclick="excluirLote('${lote.nome}')">Excluir</button>
    `;

    dashboard.appendChild(card);
  });
};

// -------------------------------
// ALTERAR QUANTIDADE
// -------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = contarExpedidasDoLote(nomeLote);
  const minimo = alocadas + expedidas;

  const novoTotal = Number(prompt(`Novo total (mínimo ${minimo})`));
  if (!novoTotal || novoTotal < minimo) return alert('Valor inválido');

  lote.total = novoTotal;
  saveState();
  renderDashboard();
};
