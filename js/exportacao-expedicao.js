// =======================================
// EXPORTACAO-EXPEDICAO.JS
// Exportação de relatórios (CSV)
// =======================================

// -------------------------------
// EXPORTAR TODAS AS EXPEDIÇÕES
// -------------------------------
window.exportarTodasExpedicoesCSV = function () {
  if (!state.historicoExpedidos || state.historicoExpedidos.length === 0) {
    alert('Nenhuma expedição para exportar');
    return;
  }

  let linhas = [];
  linhas.push([
    'Lote',
    'Tipo',
    'Área',
    'Rua',
    'Posição',
    'RZ',
    'Volume',
    'Data',
    'Hora'
  ].join(';'));

  state.historicoExpedidos.forEach(exp => {
    exp.detalhes.forEach(d => {
      linhas.push([
        exp.lote,
        exp.tipo,
        d.area,
        d.rua,
        d.posicao,
        d.rz || '',
        d.volume || '',
        exp.data,
        exp.hora
      ].join(';'));
    });
  });

  gerarCSV(linhas, 'relatorio-expedicoes.csv');
};

// -------------------------------
// EXPORTAR APENAS UM LOTE
// -------------------------------
window.exportarExpedicaoPorLote = function (nomeLote) {
  if (!nomeLote) {
    alert('Lote não informado');
    return;
  }

  const registros = state.historicoExpedidos.filter(
    e => e.lote === nomeLote
  );

  if (registros.length === 0) {
    alert('Nenhuma expedição encontrada para este lote');
    return;
  }

  let linhas = [];
  linhas.push([
    'Lote',
    'Tipo',
    'Área',
    'Rua',
    'Posição',
    'RZ',
    'Volume',
    'Data',
    'Hora'
  ].join(';'));

  registros.forEach(exp => {
    exp.detalhes.forEach(d => {
      linhas.push([
        exp.lote,
        exp.tipo,
        d.area,
        d.rua,
        d.posicao,
        d.rz || '',
        d.volume || '',
        exp.data,
        exp.hora
      ].join(';'));
    });
  });

  gerarCSV(
    linhas,
    `relatorio-expedicao-${nomeLote}.csv`
  );
};

// -------------------------------
// GERADOR CSV (UTIL)
// -------------------------------
function gerarCSV(linhas, nomeArquivo) {
  const csv = linhas.join('\n');
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
