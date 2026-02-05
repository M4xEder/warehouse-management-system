// =======================================
// DASHBOARD.JS — CONTROLE REAL DE LOTES
// =======================================

// ---------------------------------------
// CONTAR GAYLORDS NO MAPA (VERDADE)
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

  state.lotes.forEach(lote => {
    const alocados = contarGaylordsDoLote(lote.nome);
    const saldo = lote.total - alocados;

    // 🔒 LOTE TOTALMENTE EXPEDIDO → NÃO MOSTRA
    if (saldo <= 0) return;

    const percentual =
      lote.total > 0
        ? Math.round((alocados / lote.total) * 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>
      ${alocados} / ${lote.total}
      <br>
      <small>Saldo: ${saldo}</small>

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

  if (dashboard.innerHTML === '') {
    dashboard.innerHTML =
      '<p>Nenhum lote ativo (todos expedidos)</p>';
  }
};

// ---------------------------------------
// ALTERAR QUANTIDADE (PROTEGIDO)
// ---------------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const alocados = contarGaylordsDoLote(nomeLote);

  const novoTotal = Number(
    prompt(
      `Nova quantidade do lote "${nomeLote}"\n` +
      `Alocados no mapa: ${alocados}`,
      lote.total
    )
  );

  if (isNaN(novoTotal) || novoTotal <= 0) {
    alert('Quantidade inválida');
    return;
  }

  if (novoTotal < alocados) {
    alert(
      `Não pode ser menor que os ${alocados} já alocados`
    );
    return;
  }

  lote.total = novoTotal;

  saveState();
  renderDashboard();

  alert('Quantidade atualizada com sucesso');
};

// ---------------------------------------
// EXCLUIR LOTE (SÓ SE VAZIO)
// ---------------------------------------
window.excluirLote = function (nomeLote) {
  const alocados = contarGaylordsDoLote(nomeLote);

  if (alocados > 0) {
    alert(
      'Não é possível excluir.\n' +
      'Existem gaylords alocadas neste lote.'
    );
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes =
    state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};
