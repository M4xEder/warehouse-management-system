// =======================================
// EXCEL-RELATORIOS.JS
// Geração de Excel por lote (abas)
// =======================================

console.log('excel-relatorios.js carregado');

// ===============================
// UTIL — ALOCAÇÕES DO LOTE
// ===============================
function obterAlocadosDetalhados(nomeLote) {
  const dados = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          dados.push({
            Área: area.nome,
            Rua: rua.nome,
            Posição: index + 1,
            RZ: pos.rz || '',
            Volume: pos.volume || ''
          });
        }
      });
    });
  });

  return dados;
}

// ===============================
// GERAR ABA DO LOTE
// ===============================
function gerarAbaLote(relatorio) {
  const linhas = [];

  // ---- RESUMO ----
  linhas.push({
    Campo: 'Lote',
    Valor: relatorio.nome
  });
  linhas.push({ Campo: 'Status', Valor: relatorio.status });
  linhas.push({ Campo: 'Total do lote', Valor: relatorio.total });
  linhas.push({ Campo: 'Alocados', Valor: relatorio.alocados });
  linhas.push({ Campo: 'Expedidos', Valor: relatorio.expedidos });
  linhas.push({ Campo: 'Não alocados', Valor: relatorio.naoAlocados });
  linhas.push({ Campo: 'Saldo', Valor: relatorio.saldo });

  if (relatorio.mensagem) {
    linhas.push({ Campo: 'Observação', Valor: relatorio.mensagem });
  }

  linhas.push({});
  linhas.push({ Campo: 'ALOCAÇÕES ATIVAS' });

  // ---- ALOCAÇÕES ----
  const alocados = obterAlocadosDetalhados(relatorio.nome);

  if (alocados.length === 0) {
    linhas.push({ Campo: 'Nenhuma gaylord alocada' });
  } else {
    alocados.forEach(a => linhas.push(a));
  }

  linhas.push({});
  linhas.push({ Campo: 'EXPEDIÇÕES' });

  // ---- EXPEDIÇÕES ----
  if (!relatorio.registros || relatorio.registros.length === 0) {
    linhas.push({ Campo: 'Nenhuma expedição registrada' });
  } else {
    relatorio.registros.forEach(reg => {
      reg.detalhes.forEach(d => {
        linhas.push({
          Data: reg.data,
          Hora: reg.hora,
          Tipo: reg.tipo,
          Área: d.area,
          Rua: d.rua,
          Posição: d.posicao,
          RZ: d.rz || '',
          Volume: d.volume || ''
        });
      });
    });
  }

  return XLSX.utils.json_to_sheet(linhas, { skipHeader: false });
}

// ===============================
// EXPORTAR TODOS OS LOTES
// ===============================
window.exportarRelatorioExcel = function () {
  if (!state.lotes || state.lotes.length === 0) {
    alert('Nenhum lote cadastrado');
    return;
  }

  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const relatorio = consolidarLoteRelatorio(lote);
    const sheet = gerarAbaLote(relatorio);

    XLSX.utils.book_append_sheet(
      wb,
      sheet,
      lote.nome.substring(0, 31) // limite Excel
    );
  });

  XLSX.writeFile(
    wb,
    `relatorio_lotes_${new Date().toISOString().slice(0,10)}.xlsx`
  );
};

// ===============================
// EXPORTAR LOTE ESPECÍFICO
// ===============================
window.exportarRelatorioLote = function () {
  const select =
    document.getElementById('selectLoteRelatorio');

  const nomeLote = select.value;

  if (!nomeLote) {
    alert('Selecione um lote');
    return;
  }

  const relatorio =
    obterRelatorioLote(nomeLote);

  if (!relatorio) {
    alert('Lote não encontrado');
    return;
  }

  const wb = XLSX.utils.book_new();
  const sheet = gerarAbaLote(relatorio);

  XLSX.utils.book_append_sheet(wb, sheet, nomeLote);

  XLSX.writeFile(
    wb,
    `relatorio_${nomeLote}_${Date.now()}.xlsx`
  );
};
