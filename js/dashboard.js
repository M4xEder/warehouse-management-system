// =======================================
// DASHBOARD.JS
// =======================================

// -------------------------------
// CONTAR GAYLORDS ALOCADAS
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          total++;
        }
      });
    });
  });

  return total;
};

// -------------------------------
// CALCULAR SALDO DO LOTE
// -------------------------------
window.calcularSaldoLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return 0;

  const expedido = state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((soma, e) => soma + (e.quantidadeExpedida || 0), 0);

  const saldo = lote.total - expedido;
  return saldo < 0 ? 0 : saldo;
};

// -------------------------------
// RENDER DASHBOARD
// -------------------------------
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes.length) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const saldo = calcularSaldoLote(lote.nome);

    const percentual =
      lote.total > 0
        ? Math.round(((lote.total - saldo) / lote.total) * 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>
      Total: ${lote.total}<br>
      Alocados: ${alocados}<br>
      Saldo: ${saldo}

      <div class="progress-bar">
        <div class="progress-fill"
             style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <div style="margin-top:8px">
        <button onclick="abrirModalExpedicao('${lote.nome}')">
          Expedir
        </button>

        <button onclick="alterarQuantidadeLote('${lote.nome}')">
          Alterar Qtde
        </button>

        <button
          onclick="excluirLote('${lote.nome}')"
          class="danger">
          Excluir
        </button>
      </div>
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

  const minimo =
    contarGaylordsDoLote(nomeLote) +
    (lote.total - calcularSaldoLote(nomeLote));

  const novoTotal = Number(
    prompt(
      `Nova quantidade do lote "${nomeLote}"\nMínimo permitido: ${minimo}`,
      lote.total
    )
  );

  if (!novoTotal || novoTotal < minimo) {
    alert('Quantidade inválida');
    return;
  }

  lote.total = novoTotal;
  saveState();
  renderDashboard();
};

// -------------------------------
// EXCLUIR LOTE
// -------------------------------
window.excluirLote = function (nomeLote) {
  const alocados = contarGaylordsDoLote(nomeLote);
  const historico = state.historicoExpedidos.some(
    e => e.lote === nomeLote
  );

  if (alocados > 0 || historico) {
    alert('Lote não pode ser excluído');
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);
  saveState();
  renderDashboard();
  renderMapa();
};
