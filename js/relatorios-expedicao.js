// =======================================
// RELATORIOS-EXPEDICAO.JS
// Histórico de expedições
// =======================================

window.renderExpedidos = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (
    !state.historicoExpedidos ||
    state.historicoExpedidos.length === 0
  ) {
    container.innerHTML = '<p>Nenhuma expedição registrada</p>';
    return;
  }

  state.historicoExpedidos.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'lote-card';

    const tipo =
      exp.quantidade === exp.detalhes.length
        ? 'TOTAL'
        : 'PARCIAL';

    card.innerHTML = `
      <strong>Lote:</strong> ${exp.lote}<br>
      <strong>Data:</strong> ${exp.data} ${exp.hora}<br>
      <strong>Tipo:</strong> ${tipo}<br>
      <strong>Quantidade:</strong> ${exp.quantidade}

      <details style="margin-top:8px">
        <summary>Ver gaylords expedidas</summary>
        ${renderDetalhes(exp.detalhes)}
      </details>
    `;

    container.appendChild(card);
  });
};

// -------------------------------
// DETALHES DAS GAYLORDS
// -------------------------------
function renderDetalhes(detalhes) {
  if (!detalhes || detalhes.length === 0) {
    return '<p>Sem detalhes</p>';
  }

  return `
    <ul style="margin-top:6px">
      ${detalhes
        .map(
          d => `
        <li>
          Área: <strong>${d.area}</strong> |
          Rua: <strong>${d.rua}</strong> |
          Posição: <strong>${d.posicao}</strong><br>
          RZ: <strong>${d.rz}</strong> |
          Volume: <strong>${d.volume}</strong>
        </li>
      `
        )
        .join('')}
    </ul>
  `;
}
