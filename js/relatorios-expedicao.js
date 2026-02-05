// =======================================
// RELATORIOS-EXPEDICAO.JS
// Histórico, detalhes e exclusão
// =======================================

// ---------------------------------------
// CONTAR EXPEDIÇÕES PARCIAIS DO LOTE
// ---------------------------------------
function contarParciaisAntes(expAtual) {
  return state.historicoExpedidos.filter(exp =>
    exp.lote === expAtual.lote &&
    exp.tipo === 'PARCIAL' &&
    new Date(`${exp.data} ${exp.hora}`) <
    new Date(`${expAtual.data} ${expAtual.hora}`)
  ).length;
}

// ---------------------------------------
// RENDER HISTÓRICO
// ---------------------------------------
window.renderExpedidos = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (!state.historicoExpedidos || state.historicoExpedidos.length === 0) {
    container.innerHTML = '<p>Nenhuma expedição registrada</p>';
    return;
  }

  state.historicoExpedidos.forEach(exp => {
    const badgeColor =
      exp.tipo === 'TOTAL' ? '#16a34a' : '#ca8a04';

    const div = document.createElement('div');
    div.className = 'historico-item';

    div.innerHTML = `
      <strong>Lote:</strong> ${exp.lote}
      <span style="
        background:${badgeColor};
        color:#fff;
        padding:2px 6px;
        border-radius:4px;
        font-size:12px;
        margin-left:6px;
      ">
        ${exp.tipo}
      </span>
      <br>

      <strong>Quantidade:</strong>
      ${exp.quantidadeExpedida} de ${exp.quantidadeTotal}
      <br>

      <strong>Data:</strong> ${exp.data} ${exp.hora}
      <br><br>

      <button onclick="abrirDetalhesExpedicao('${exp.id}')">
        Ver detalhes
      </button>

      <button class="danger"
        onclick="excluirExpedicao('${exp.id}')">
        Excluir
      </button>
    `;

    container.appendChild(div);
  });
};

// ---------------------------------------
// MODAL DETALHES
// ---------------------------------------
window.abrirDetalhesExpedicao = function (id) {
  const exp = state.historicoExpedidos.find(e => e.id === id);
  if (!exp) {
    alert('Registro de expedição não encontrado');
    return;
  }

  const container =
    document.getElementById('conteudoDetalhesExpedicao');

  const badgeColor =
    exp.tipo === 'TOTAL' ? '#16a34a' : '#ca8a04';

  // 👉 CONTAGEM DE PARCIAIS
  let avisoParciais = '';
  if (exp.tipo === 'TOTAL') {
    const qtdParciais = contarParciaisAntes(exp);

    if (qtdParciais > 0) {
      avisoParciais = `
        <div style="
          margin:10px 0;
          padding:8px;
          background:#f0fdf4;
          border-left:4px solid #16a34a;
          font-size:14px;
        ">
          🧾 Este lote teve
          <strong>${qtdParciais}</strong>
          expedição${qtdParciais > 1 ? 's' : ''}
          parcial${qtdParciais > 1 ? 'is' : ''}
          antes da expedição final.
        </div>
      `;
    }
  }

  let html = `
    <p>
      <strong>Lote:</strong> ${exp.lote}<br>
      <strong>Tipo:</strong>
      <span style="
        background:${badgeColor};
        color:#fff;
        padding:2px 6px;
        border-radius:4px;
        font-size:12px;
      ">
        ${exp.tipo}
      </span><br>
      <strong>Quantidade:</strong>
      ${exp.quantidadeExpedida} de ${exp.quantidadeTotal}<br>
      <strong>Data:</strong> ${exp.data} ${exp.hora}
    </p>

    ${avisoParciais}

    <hr>

    <strong>Gaylords expedidas:</strong>

    <div style="
      max-height:300px;
      overflow:auto;
      margin-top:8px;
      border:1px solid #ddd;
      padding:6px;
    ">
  `;

  exp.detalhes.forEach((d, index) => {
    html += `
      <div style="
        border-bottom:1px solid #eee;
        padding:6px 0;
      ">
        <strong>${index + 1}.</strong>
        Área: ${d.area} |
        Rua: ${d.rua} |
        Posição: ${d.posicao}
        <br>
        RZ: <strong>${d.rz || '-'}</strong> |
        Volume: <strong>${d.volume || '-'}</strong>
      </div>
    `;
  });

  html += '</div>';

  container.innerHTML = html;

  document
    .getElementById('modalDetalhesExpedicao')
    .classList.remove('hidden');
};

// ---------------------------------------
// FECHAR MODAL
// ---------------------------------------
window.fecharDetalhesExpedicao = function () {
  document
    .getElementById('modalDetalhesExpedicao')
    .classList.add('hidden');
};

// ---------------------------------------
// EXCLUIR REGISTRO
// ---------------------------------------
window.excluirExpedicao = function (id) {
  const exp = state.historicoExpedidos.find(e => e.id === id);
  if (!exp) return;

  if (!confirm(
    `Excluir registro de expedição do lote "${exp.lote}"?\n` +
    `Isso NÃO altera mapa nem saldo.`
  )) return;

  state.historicoExpedidos =
    state.historicoExpedidos.filter(e => e.id !== id);

  saveState();
  renderExpedidos();
  renderDashboard();

  alert('Registro removido com sucesso');
};
