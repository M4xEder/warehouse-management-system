// =======================================
// DASHBOARD.JS — CONTROLE REAL DE LOTES
// =======================================

console.log('dashboard.js carregado');

// ===============================
// CONTAR GAYLORDS ALOCADAS (MAPA)
// ===============================
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

// ===============================
// CONTAR EXPEDIÇÕES DO LOTE
// ===============================
function contarExpedidasDoLote(nomeLote) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === nomeLote) {
      total += exp.quantidadeExpedida;
    }
  });

  return total;
}

// ===============================
// RENDER DASHBOARD
// ===============================
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote cadastrado</p>';
    return;
  }

  let existeAtivo = false;

  state.lotes.forEach(lote => {
    const total = lote.total;
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarExpedidasDoLote(lote.nome);
    const saldo = total - expedidas;
    const naoAlocadas = Math.max(saldo - alocadas, 0);

    // 🔒 REGRA FINAL DE LOTE ATIVO
    if (saldo <= 0) return;

    existeAtivo = true;

    const percentual =
      total > 0
        ? Math.min(Math.round((alocadas / total) * 100), 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong style="font-size:16px;">${lote.nome}</strong>

      <div style="font-size:13px; margin-top:6px;">
        <div>Total: <strong>${total}</strong></div>
        <div>Alocadas: <strong>${alocadas}</strong></div>
        <div>Expedidas: <strong>${expedidas}</strong></div>
        <div>Não alocadas: <strong>${naoAlocadas}</strong></div>
        <div>Saldo: <strong>${saldo}</strong></div>
      </div>

      <div class="progress-bar" style="margin-top:8px;">
        <div class="progress-fill"
             style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <div style="margin-top:10px;">
        <button onclick="expedirLote('${lote.nome}')">
          Expedir
        </button>

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

  if (!existeAtivo) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
  }
};

// ===============================
// ALTERAR QUANTIDADE DO LOTE
// ===============================
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const expedidas = contarExpedidasDoLote(nomeLote);

  const novoTotal = Number(
    prompt(
      `Quantidade atual: ${lote.total}\n` +
      `Já expedidas: ${expedidas}\n\n` +
      `Informe a nova quantidade total:`
    )
  );

  if (!novoTotal || novoTotal <= 0) {
    alert('Quantidade inválida');
    return;
  }

  if (novoTotal < expedidas) {
    alert(
      'A nova quantidade não pode ser menor que o total já expedido'
    );
    return;
  }

  lote.total = novoTotal;

  saveState();
  renderDashboard();
  renderMapa();
};

// ===============================
// EXCLUIR LOTE ATIVO (SEGURO)
// ===============================
window.excluirLote = function (nomeLote) {
  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = contarExpedidasDoLote(nomeLote);

  if (alocadas > 0) {
    alert('Não é possível excluir. Existem gaylords alocadas.');
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
