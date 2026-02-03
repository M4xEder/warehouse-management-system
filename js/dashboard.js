// =======================================
// DASHBOARD.JS
// Visualização e ações dos lotes
// =======================================

// -------------------------------
// CONTAR GAYLORDS DE UM LOTE
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  if (!state.areas) return 0;

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

  if (!Array.isArray(state.lotes) || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const usados = contarGaylordsDoLote(lote.nome);
    const total = lote.total || 0;

    const percentual =
      total > 0 ? Math.round((usados / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>
      <small>${usados} / ${total} alocados</small>

      <div class="progress-bar">
        <div
          class="progress-fill"
          style="
            width:${percentual}%;
            background:${lote.cor || '#999'};
          ">
        </div>
      </div>

      <div style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap;">
        <button onclick="expedirLote('${lote.nome}')">
          Expedir
        </button>

        <button onclick="alterarQuantidadeLote('${lote.nome}')">
          Alterar Quantidade
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

// =======================================
// ALTERAR QUANTIDADE DO LOTE
// =======================================
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const alocados = contarGaylordsDoLote(nomeLote);

  const novoTotal = Number(
    prompt(
      `Nova quantidade para o lote "${nomeLote}"\n` +
      `Já alocados: ${alocados}`,
      lote.total
    )
  );

  if (isNaN(novoTotal) || novoTotal <= 0) {
    alert('Quantidade inválida');
    return;
  }

  if (novoTotal < alocados) {
    alert(
      `Quantidade não pode ser menor que os já alocados (${alocados})`
    );
    return;
  }

  lote.total = novoTotal;

  saveState();
  renderDashboard();

  alert(`Quantidade do lote "${nomeLote}" atualizada com sucesso`);
};

// -------------------------------
// EXCLUIR LOTE (SOMENTE SE VAZIO)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const usados = contarGaylordsDoLote(nomeLote);

  if (usados > 0) {
    alert('Não é possível excluir. Existem gaylords alocados.');
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
};
