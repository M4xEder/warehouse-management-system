// =======================================
// RELATORIOS-EXPEDICAO.JS
// Histórico + Detalhes + Exportação
// Seguro para index.html e relatorios.html
// =======================================

// =======================================
// RENDER HISTÓRICO DE EXPEDIÇÃO (INDEX)
// =======================================
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
    `;

    container.appendChild(div);
  });
};

// =======================================
// MODAL – DETALHES DA EXPEDIÇÃO
// =======================================
window.abrirDetalhesExpedicao = function (id) {
  const exp = state.historicoExpedidos.find(e => e.id === id);
  if (!exp) {
    alert('Registro de expedição não encontrado');
    return;
  }

  const container =
    document.getElementById('conteudoDetalhesExpedicao');
  if (!container) return;

  const badgeColor =
    exp.tipo === 'TOTAL' ? '#16a34a' : '#ca8a04';

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
      <strong>Data:</strong> ${exp.data} ${exp.hora}
    </p>

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
      <div style="border-bottom:1px solid #eee; padding:6px 0;">
        <strong>${index + 1}.</strong>
        Área: ${d.area} |
        Rua: ${d.rua} |
        Posição: ${d.posicao}<br>
        RZ: <strong>${d.rz || '-'}</strong> |
        Volume: <strong>${d.volume || '-'}</strong>
      </div>
    `;
  });

  html += '</div>';

  container.innerHTML = html;

  document
    .getElementById('modalDetalhesExpedicao')
    ?.classList.remove('hidden');
};

window.fecharDetalhesExpedicao = function () {
  document
    .getElementById('modalDetalhesExpedicao')
    ?.classList.add('hidden');
};

// =======================================
// RELATÓRIOS (SÓ RODA SE EXISTIR A PÁGINA)
// =======================================
document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select || !Array.isArray(state?.lotes)) return;

  select.innerHTML = '<option value="">Todos os lotes</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
});

// =======================================
// EXPORTAÇÃO EXCEL / CSV
// =======================================
window.exportarRelatorio = function (formato = 'excel') {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return alert('Página de relatório não carregada');

  const loteSelecionado = select.value;

  let linhas = [
    [
      'Lote',
      'Área',
      'Rua',
      'Posição',
      'RZ',
      'Volume',
      'Status',
      'Tipo Expedição',
      'Data Expedição',
      'Total Gaylords Lote'
    ]
  ];

  state.lotes.forEach(lote => {
    if (loteSelecionado && lote.nome !== loteSelecionado) return;

    const totalGaylords = lote.total || 0;

    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.lote !== lote.nome) return;

          const exp = state.historicoExpedidos.find(e =>
            e.detalhes.some(d =>
              d.area === area.nome &&
              d.rua === rua.nome &&
              d.posicao === pos.nome
            )
          );

          linhas.push([
            lote.nome,
            area.nome,
            rua.nome,
            pos.nome,
            pos.rz || '',
            pos.volume || '',
            pos.ocupada ? 'Expedido' : 'Não expedido',
            exp?.tipo || '',
            exp ? `${exp.data} ${exp.hora}` : '',
            totalGaylords
          ]);
        });
      });
    });
  });

  if (linhas.length === 1) {
    alert('Nenhum dado para exportar');
    return;
  }

  gerarArquivo(linhas, formato);
};

// =======================================
// GERADOR CSV / XLS
// =======================================
function gerarArquivo(linhas, formato) {
  const conteudo = linhas
    .map(l => l.map(v => `"${v}"`).join(';'))
    .join('\n');

  const blob = new Blob([conteudo], {
    type:
      formato === 'excel'
        ? 'application/vnd.ms-excel'
        : 'text/csv'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download =
    `relatorio_expedicao_${new Date().toISOString().slice(0, 10)}.${formato === 'excel' ? 'xls' : 'csv'}`;

  link.click();
}
