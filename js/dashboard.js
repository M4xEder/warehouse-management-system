// =======================================
// DASHBOARD.JS
// Controle correto de lotes ativos
// =======================================

// -------------------------------
// TOTAL EXPEDIDO DO LOTE
// -------------------------------
window.totalExpedidoDoLote = function (nomeLote) {
  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((acc, e) => acc + e.quantidadeExpedida, 0);
};

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
// RENDER DASHBOARD
// -------------------------------
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const expedido = totalExpedidoDoLote(lote.nome);
    const alocado = contarGaylordsDoLote(lote.nome);
    const total = lote.total;

    // 🔐 REGRA: só some se 100% expedido
    if (expedido >= total) return;

    const percentual =
      total > 0 ? Math.round((expedido / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>

      Expedidos: ${expedido} / ${total}<br>
      Alocados: ${alocado}<br>
      Não alocados: ${total - expedido - alocado}

      <div class="progress-bar">
        <div class="progress-fill"
          style="
            width:${percentual}%;
            background:${lote.cor};
          ">
        </div>
      </div>

      <div style="margin-top:8px">
        <button onclick="abrirModalExpedicao('${lote.nome}')">
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
};

// -------------------------------
// ALTERAR QUANTIDADE DO LOTE
// -------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocados = contarGaylordsDoLote(nomeLote);
  const expedido = totalExpedidoDoLote(nomeLote);

  const minimo = alocados + expedido;

  const novoTotal = Number(
    prompt(
      `Nova quantidade para o lote "${nomeLote}"\n` +
      `Já expedidos: ${expedido}\n` +
      `Alocados: ${alocados}\n` +
      `Mínimo permitido: ${minimo}`,
      lote.total
    )
  );

  if (isNaN(novoTotal) || novoTotal < minimo) {
    alert('Quantidade inválida');
    return;
  }

  lote.total = novoTotal;
  saveState();
  renderDashboard();

  alert('Quantidade atualizada com sucesso');
};

// -------------------------------
// EXCLUIR LOTE (SOMENTE SE VAZIO)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const alocados = contarGaylordsDoLote(nomeLote);
  const expedido = totalExpedidoDoLote(nomeLote);

  if (alocados > 0 || expedido > 0) {
    alert(
      'Não é possível excluir um lote com histórico ou gaylords alocadas'
    );
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
};
