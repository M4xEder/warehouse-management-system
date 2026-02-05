// =======================================
// DASHBOARD.JS — CONTROLE REAL DE LOTES
// =======================================

// -------------------------------
// CONTA GAYLORDS ALOCADAS NO MAPA
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
// TOTAL EXPEDIDO DO LOTE (HISTÓRICO)
// -------------------------------
window.totalExpedidoDoLote = function (nomeLote) {
  if (!state.historicoExpedidos) return 0;

  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((soma, e) => soma + e.quantidadeExpedida, 0);
};

// -------------------------------
// RENDER DASHBOARD
// -------------------------------
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote cadastrado</p>';
    return;
  }

  let ativosEncontrados = 0;

  state.lotes.forEach(lote => {
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = totalExpedidoDoLote(lote.nome);
    const saldo = lote.total - expedidas;

    // ===============================
    // REGRA DE LOTE ATIVO (CRÍTICA)
    // ===============================
    const loteAtivo = saldo > 0 || alocadas > 0;

    if (!loteAtivo) return; // ❌ só aqui o lote some

    ativosEncontrados++;

    const percentual =
      lote.total > 0
        ? Math.round((alocadas / lote.total) * 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong>

      <div style="font-size:13px; margin:6px 0;">
        <div><strong>Total:</strong> ${lote.total}</div>
        <div><strong>Alocadas:</strong> ${alocadas}</div>
        <div><strong>Expedidas:</strong> ${expedidas}</div>
        <div><strong>Saldo:</strong> ${saldo}</div>
      </div>

      <div class="progress-bar">
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
          class="danger"
          onclick="excluirLote('${lote.nome}')">
          Excluir
        </button>
      </div>
    `;

    dashboard.appendChild(card);
  });

  if (ativosEncontrados === 0) {
    dashboard.innerHTML =
      '<p>Nenhum lote ativo no momento</p>';
  }
};

// -------------------------------
// EXCLUIR LOTE (SOMENTE SE SEGURO)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = totalExpedidoDoLote(nomeLote);

  if (alocadas > 0) {
    alert('Não é possível excluir. Existem gaylords alocadas no mapa.');
    return;
  }

  if (expedidas > 0) {
    alert(
      'Não é possível excluir. Este lote possui histórico de expedição.'
    );
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};
