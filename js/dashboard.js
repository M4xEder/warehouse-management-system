// =======================================
// DASHBOARD.JS — CONTROLE REAL DE LOTES
// =======================================

// -------------------------------
// CONTAR ALOCADAS (MAPA = VERDADE)
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
// CONTAR EXPEDIDAS
// -------------------------------
window.contarExpedidasDoLote = function (nomeLote) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === nomeLote) {
      total += exp.quantidadeExpedida;
    }
  });

  return total;
};

// -------------------------------
// DASHBOARD
// -------------------------------
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';
  let temLote = false;

  state.lotes.forEach(lote => {
    const total = lote.total;
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarExpedidasDoLote(lote.nome);
    const saldo = total - expedidas;
    const naoAlocadas = Math.max(total - (alocadas + expedidas), 0);

    const finalizado = saldo <= 0;
    temLote = true;

    const percentual =
      total > 0 ? Math.round((alocadas / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong>

      <div style="font-size:13px; margin-top:6px;">
        <div>Total: <strong>${total}</strong></div>
        <div>Alocadas: <strong>${alocadas}</strong></div>
        <div>Expedidas: <strong>${expedidas}</strong></div>
        <div>Não alocadas: <strong>${naoAlocadas}</strong></div>
        <div>Saldo: <strong>${saldo}</strong></div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill"
             style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <div style="margin-top:8px">
        ${finalizado ? '' : `
          <button onclick="expedirLote('${lote.nome}')">Expedir</button>
        `}
        <button onclick="alterarQuantidadeLote('${lote.nome}')">
          Alterar quantidade
        </button>
        <button class="danger"
                onclick="excluirLote('${lote.nome}')">
          Excluir
        </button>
      </div>
    `;

    dashboard.appendChild(card);
  });

  if (!temLote) {
    dashboard.innerHTML = '<p>Nenhum lote cadastrado</p>';
  }
};
