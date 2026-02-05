// =======================================
// DASHBOARD.JS — CONTROLE POR SALDO
// =======================================

console.log('dashboard.js carregado');

// ---------------------------------------
// TOTAL ALOCADO NO MAPA (VERDADE FÍSICA)
// ---------------------------------------
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

// ---------------------------------------
// TOTAL JÁ EXPEDIDO (HISTÓRICO)
// ---------------------------------------
window.totalExpedidoDoLote = function (nomeLote) {
  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((soma, e) => soma + e.quantidadeExpedida, 0);
};

// ---------------------------------------
// SALDO REAL DO LOTE
// ---------------------------------------
window.saldoDoLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return 0;

  const expedido = totalExpedidoDoLote(nomeLote);
  return lote.total - expedido;
};

// ---------------------------------------
// RENDER DASHBOARD
// ---------------------------------------
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const total = lote.total;
    const expedido = totalExpedidoDoLote(lote.nome);
    const alocado = contarGaylordsDoLote(lote.nome);
    const saldo = saldoDoLote(lote.nome);

    // 🔴 LOTE TOTALMENTE EXPEDIDO
    if (saldo <= 0) return;

    const percentual =
      total > 0 ? Math.round((expedido / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>

      <small>
        Total: ${total} |
        Expedidos: ${expedido} |
        Alocados: ${alocado} |
        Saldo: ${saldo}
      </small>

      <div class="progress-bar" style="margin-top:6px">
        <div class="progress-fill"
          style="
            width:${percentual}%;
            background:${lote.cor};
          ">
        </div>
      </div>

      <div style="margin-top:10px">
        <button onclick="expedirLote('${lote.nome}')">
          Expedir
        </button>

        <button onclick="alterarQuantidadeLote('${lote.nome}')">
          Alterar quantidade
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

// ---------------------------------------
// ALTERAR QUANTIDADE DO LOTE (SEGURA)
// ---------------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const expedido = totalExpedidoDoLote(nomeLote);

  const novoTotal = Number(
    prompt(
      `Novo total para o lote "${nomeLote}"\n` +
      `(Não pode ser menor que já expedido: ${expedido})`,
      lote.total
    )
  );

  if (!novoTotal || novoTotal < expedido) {
    alert(
      `Quantidade inválida.\n` +
      `Já foram expedidas ${expedido} gaylords.`
    );
    return;
  }

  lote.total = novoTotal;

  saveState();
  renderDashboard();
  renderMapa();
};

// ---------------------------------------
// EXCLUIR LOTE (SOMENTE SE VAZIO E SEM HISTÓRICO)
// ---------------------------------------
window.excluirLote = function (nomeLote) {
  const alocado = contarGaylordsDoLote(nomeLote);
  const expedido = totalExpedidoDoLote(nomeLote);

  if (alocado > 0 || expedido > 0) {
    alert(
      'Não é possível excluir.\n' +
      'Existem gaylords alocadas ou já expedidas.'
    );
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};
