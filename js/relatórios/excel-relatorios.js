// =======================================
// EXCEL-RELATORIOS.JS
// Exportação de lotes para Excel
// =======================================

console.log('excel-relatorios.js carregado');

// -------------------------------
// EXPORTAR TODOS OS LOTES
// -------------------------------
window.exportarRelatorioExcel = function () {
  if (!state.lotes || state.lotes.length === 0) {
    alert('Não há lotes para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const dados = consolidarLoteRelatorio(lote.nome);

    if (!dados) return;

    // Montar linhas do Excel
    const linhas = [];

    linhas.push([
      `Total do Lote: ${dados.total}`,
      `Alocados: ${dados.alocados}`,
      `Expedidos: ${dados.expedidos}`,
      `Não Alocados: ${dados.naoAlocados}`,
      `Saldo: ${dados.saldo}`
    ]);

    linhas.push([`Mensagem: ${dados.mensagem}`]);
    linhas.push([]);
    linhas.push([
      'ALOCADOS NO MAPA',
      'Área',
      'Rua',
      'Posição',
      'RZ',
      'Volume'
    ]);

    dados.listaAlocados.forEach(a => {
      linhas.push(['', a.area, a.rua, a.posicao, a.rz, a.volume]);
    });

    linhas.push([]);
    linhas.push([
      'EXPEDIDOS',
      'Data',
      'Hora',
      'RZ',
      'Volume'
    ]);

    dados.listaExpedidos.forEach(e => {
      linhas.push(['', e.data, e.hora, e.rz, e.volume]);
    });

    const ws = XLSX.utils.aoa_to_sheet(linhas);
    XLSX.utils.book_append_sheet(wb, ws, lote.nome.substring(0, 30));
  });

  XLSX.writeFile(wb, `relatorios_lotes_${Date.now()}.xlsx`);
};

// -------------------------------
// EXPORTAR LOTE ESPECÍFICO
// -------------------------------
window.exportarRelatorioLote = function () {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  const loteNome = select.value;
  if (!loteNome) {
    alert('Selecione um lote para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();
  const dados = consolidarLoteRelatorio(loteNome);

  if (!dados) {
    alert('Lote não encontrado');
    return;
  }

  // Montar linhas
  const linhas = [];

  linhas.push([
    `Total do Lote: ${dados.total}`,
    `Alocados: ${dados.alocados}`,
    `Expedidos: ${dados.expedidos}`,
    `Não Alocados: ${dados.naoAlocados}`,
    `Saldo: ${dados.saldo}`
  ]);

  linhas.push([`Mensagem: ${dados.mensagem}`]);
  linhas.push([]);
  linhas.push([
    'ALOCADOS NO MAPA',
    'Área',
    'Rua',
    'Posição',
    'RZ',
    'Volume'
  ]);

  dados.listaAlocados.forEach(a => {
    linhas.push(['', a.area, a.rua, a.posicao, a.rz, a.volume]);
  });

  linhas.push([]);
  linhas.push([
    'EXPEDIDOS',
    'Data',
    'Hora',
    'RZ',
    'Volume'
  ]);

  dados.listaExpedidos.forEach(e => {
    linhas.push(['', e.data, e.hora, e.rz, e.volume]);
  });

  const ws = XLSX.utils.aoa_to_sheet(linhas);
  XLSX.utils.book_append_sheet(wb, ws, loteNome.substring(0, 30));

  XLSX.writeFile(wb, `relatorio_${loteNome}_${Date.now()}.xlsx`);
};
