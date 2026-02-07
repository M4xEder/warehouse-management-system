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
// CONTAR EXPEDIDAS (HISTÓRICO)
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
  let temAtivo = false;

  state.lotes.forEach(lote => {
    // 🔒 REGRA ÚNICA
    if (!lote.ativo) return;

    temAtivo = true;

    const total = lote.total;
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarExpedidasDoLote(lote.nome);
    const saldo = lote.saldo;
    const naoAlocadas = Math.max(total - (alocadas + expedidas), 0);

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
        <button onclick="expedirLote('${lote.nome}')">Expedir</button>
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

  if (!temAtivo) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
  }
};

// -------------------------------
// ALTERAR QUANTIDADE (REGRA REAL)
// -------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return alert('Lote não encontrado');

  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = contarExpedidasDoLote(nomeLote);
  const minimo = alocadas + expedidas;

  const novoTotal = Number(
    prompt(
      `Lote: ${nomeLote}\n\n` +
      `Total atual: ${lote.total}\n` +
      `Alocadas: ${alocadas}\n` +
      `Expedidas: ${expedidas}\n\n` +
      `Novo total (mínimo permitido: ${minimo})`
    )
  );

  if (!novoTotal || novoTotal < minimo) {
    alert(
      `Quantidade inválida.\n` +
      `O total não pode ser menor que ${minimo}.`
    );
    return;
  }

  lote.total = novoTotal;

  // 🔒 Ajusta saldo se necessário
  const novoSaldo = novoTotal - expedidas;
  lote.saldo = Math.max(novoSaldo, 0);
  lote.ativo = lote.saldo > 0;

  saveState();
  renderDashboard();
  renderMapa();
};
