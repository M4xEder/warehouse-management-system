// =======================================
// RELATORIOS-EXPEDICAO.JS
// Histórico expedição

window.renderExpedidos = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (!state.historicoExpedidos.length) {
    container.innerHTML = '<p>Nenhuma expedição realizada</p>';
    return;
  }

  state.historicoExpedidos.forEach(exp => {
    const badgeColor =
      exp.tipo === 'TOTAL' ? '#16a34a' : '#ca8a04';

    const div = document.createElement('div');
    div.className = 'historico-item';

    div.innerHTML = `
      <strong>${exp.lote}</strong>
      <span
        style="
          background:${badgeColor};
          color:#fff;
          padding:2px 6px;
          border-radius:4px;
          font-size:12px;
          margin-left:6px;
        "
      >
        ${exp.tipo}
      </span>
      <br>
      ${exp.quantidadeExpedida} de ${exp.quantidadeTotal}
      <br>
      ${exp.data} ${exp.hora}
    `;

    container.appendChild(div);
  });
};
