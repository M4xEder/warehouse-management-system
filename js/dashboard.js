// =======================================
// DASHBOARD.JS — LOTES ATIVOS (COM SALDO)
// =======================================

// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
// (MAPA É A FONTE DA VERDADE)
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada === true && pos.lote === nomeLote) {
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

  const lotesAtivos = state.lotes.filter(l => l.ativo !== false);

  if (lotesAtivos.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  lotesAtivos.forEach(lote => {
    const usados = contarGaylordsDoLote(lote.nome);

    // 🧠 SALDO REAL
    lote.saldo = lote.total - usados;
    if (lote.saldo < 0) lote.saldo = 0;

    const percentual =
      lote.total > 0
        ? Math.round((usados / lote.total) * 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>

      <span>
        ${usados} / ${lote.total}
        <small style="color:#666">
          (Saldo: ${lote.saldo})
        </small>
      </span>

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

  saveState();
};

// -------------------------------
// ALTERAR QUANTIDADE DO LOTE
// -------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const usados = contarGaylordsDoLote(nomeLote);

  const novoTotal = Number(
    prompt(
      `Nova quantidade do lote "${nomeLote}"\n` +
      `Já alocados: ${usados}`,
      lote.total
    )
  );

  if (isNaN(novoTotal) || novoTotal <= 0) {
    alert('Quantidade inválida');
    return;
  }

  if (novoTotal < usados) {
    alert(
      `Não pode ser menor que os já alocados (${usados})`
    );
    return;
  }

  lote.total = novoTotal;
  lote.saldo = novoTotal - usados;
  lote.ativo = true;

  saveState();
  renderDashboard();

  alert('Quantidade atualizada com sucesso');
};

// -------------------------------
// EXCLUIR LOTE (SOMENTE SE VAZIO)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const usados = contarGaylordsDoLote(nomeLote);

  if (usados > 0) {
    alert('Não é possível excluir. Existem gaylords alocadas.');
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};
