// =======================================
// RELATÓRIO DE EXPEDIÇÃO
// CSV e EXCEL
// =======================================

// -------------------------------
// GERAR DADOS NORMALIZADOS
// -------------------------------
function gerarDadosRelatorio() {
  if (!state.expedicoes || state.expedicoes.length === 0) {
    alert('Nenhuma expedição registrada');
    return [];
  }

  const linhas = [];

  state.expedicoes.forEach(exp => {
    exp.gaylords.forEach(g => {
      linhas.push({
        Lote: exp.lote,
        Tipo: exp.tipo,
        RZ: g.rz,
        Volume: g.volume,
        Data: exp.data,
        ExpedicaoID: exp.id
      });
    });
  });

  return linhas;
}

// -------------------------------
// EXPORTAR CSV
// -------------------------------
window.exportarCSVExpedicao = function () {
  const dados = gerarDadosRelatorio();
  if (dados.length === 0) return;

  const cabecalho = Object.keys(dados[0]).join(';');
  const linhas = dados.map(l =>
    Object.values(l).join(';')
  );

  const csv = [cabecalho, ...linhas].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'relatorio_expedicao.csv';
  a.click();

  URL.revokeObjectURL(url);
};

// -------------------------------
// EXPORTAR EXCEL (.XLSX)
// -------------------------------
window.exportarExcelExpedicao = function () {
  const dados = gerarDadosRelatorio();
  if (dados.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    'Expedições'
  );

  XLSX.writeFile(workbook, 'relatorio_expedicao.xlsx');
};
