// =======================================
// DASHBOARD.JS — CONTROLE REAL DE SALDO
// =======================================

// ---------------------------------------
// TOTAL JÁ EXPEDIDO DO LOTE (HISTÓRICO)
// ---------------------------------------
window.totalExpedidoDoLote = function (nomeLote) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === nomeLote) {
      total += exp.quantidadeExpedida;
    }
  });

  return total;
};

// ---------------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
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

  let exibiuAlgum = false;

  state.lotes.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const expedidos = totalExpedidoDoLote(lote.nome);
    const saldo = lote.total - expedidos;

    // 👉 SE NÃO TEM SALDO, NÃO É ATIVO
    if (saldo <= 0) return;

    exibiuAlgum = true;

    const percentual =
      lote.total > 0
        ? Math.round((alocados / lote.total) * 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>

      Total: ${lote.total}<br>
      Alocados: ${alocados}<br>
      Expedidos: ${expedidos}<br>
      <strong>Saldo: ${saldo}</strong>

      <div class="progress-bar">
        <div class="progress-fill"
          style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <div style="margin-top:8px">
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

  if (!exibiuAlgum) {
    dashboard.innerHTML =
      '<p>Todos os lotes foram totalmente expedidos</p>';
  }
};
