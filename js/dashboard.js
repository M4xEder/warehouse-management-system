// =======================================
// DASHBOARD.JS — CONTROLE DEFINITIVO
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
    const total = lote.total;
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarExpedidasDoLote(lote.nome);
    const saldo = total - expedidas;
    const naoAlocadas = Math.max(total - (alocadas + expedidas), 0);

    // 🔒 Se saldo = 0 → totalmente expedido → NÃO é ativo
    if (saldo <= 0) return;

    temAtivo = true;

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

  if (!temAtivo) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
  }
};

// -------------------------------
// ALTERAR QUANTIDADE (SEGURA)
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

  saveState();
  renderDashboard();
  renderMapa();
};

// -------------------------------
// EXCLUIR LOTE ATIVO (CORRETO)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const alocadas = contarGaylordsDoLote(nomeLote);

  if (alocadas > 0) {
    alert(
      'Não é possível excluir este lote.\n' +
      'Existem gaylords alocadas no mapa.'
    );
    return;
  }

  if (!confirm(`Excluir definitivamente o lote "${nomeLote}"?`)) {
    return;
  }

  // Remove APENAS do cadastro de lotes
  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();

  alert('Lote excluído com sucesso');
};
