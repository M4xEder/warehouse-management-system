// =======================================
// EXPORTAÇÃO DE EXPEDIÇÃO
// CSV / EXCEL
// =======================================

function montarDadosExpedicao() {
  const linhas = [];

  if (!state.historicoExpedidos) return linhas;

  state.historicoExpedidos.forEach(exp => {
    exp.detalhes.forEach(d => {
      linhas.push({
        Lote: exp.lote,
        Tipo: exp.tipo,
        Data: exp.data,
        Hora: exp.hora,
        Área: d.area,
        Rua: d.rua,
        Posição: d.posicao,
        RZ: d.rz || '',
        Volume: d.volume || ''
      });
    });
  });

  return linhas;
}

// CSV
window.exportarCSVExpedicao = function () {
  const dados = montarDadosExpedicao();
  if (dados.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  const headers = Object.keys(dados[0]).join(';');
  const linhas = dados.map(d =>
    Object.values(d).join(';')
  );

  const csv = [headers, ...linhas].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = 'relatorio-expedicao.csv';
  link.click();
};

// Excel
window.exportarExcelExpedicao = function () {
  const dados = montarDadosExpedicao();
  if (dados.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Expedições');
  XLSX.writeFile(wb, 'relatorio-expedicao.xlsx');
};
