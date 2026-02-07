// ===============================
// DASHBOARD.JS — CONTROLE REAL
// ===============================

window.contarExpedidasDoLote = function (nomeLote) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === nomeLote) {
      total += exp.quantidadeExpedida;
    }
  });

  return total;
};

// ===============================
// DASHBOARD
// ===============================
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';
  let temAtivo = false;

  state.lotes.forEach(lote => {
    const total = lote.total;
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarExpedidasDoLote(lote.nome);

    const saldo = Math.max(total - expedidas, 0);
    const naoAlocadas = Math.max(saldo - alocadas, 0);

    if (saldo <= 0) return;

    temAtivo = true;

    const percentual =
      total > 0 ? Math.round((alocadas / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong>

      <div>Total: <strong>${total}</strong></div>
      <div>Alocadas: <strong>${alocadas}</strong></div>
      <div>Expedidas: <strong>${expedidas}</strong></div>
      <div>Não alocadas: <strong>${naoAlocadas}</strong></div>
      <div>Saldo: <strong>${saldo}</strong></div>

      <div class="progress-bar">
        <div class="progress-fill"
             style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <button onclick="expedirLote('${lote.nome}')">Expedir</button>
      <button onclick="alterarQuantidadeLote('${lote.nome}')">
        Alterar quantidade
      </button>
      <button class="danger"
              onclick="excluirLote('${lote.nome}')">
        Excluir
      </button>
    `;

    dashboard.appendChild(card);
  });

  if (!temAtivo) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
  }
};

// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = contarExpedidasDoLote(nomeLote);
  const minimo = alocadas + expedidas;

  const novoTotal = Number(
    prompt(
      `Novo total (mínimo ${minimo}):`,
      lote.total
    )
  );

  if (!novoTotal || novoTotal < minimo) {
    alert(`O total não pode ser menor que ${minimo}`);
    return;
  }

  lote.total = novoTotal;
  saveState();
  renderDashboard();
  renderMapa();
};
