// =======================================
// EXPORTACAO-EXPEDICAO.JS
// Exportação CSV de expedições
// =======================================

window.exportarExpedicoesCSV = function () {
  if (!state.historicoExpedidos || state.historicoExpedidos.length === 0) {
    alert('Nenhuma expedição para exportar');
    return;
  }

  let csv =
    'Lote,Tipo,Data,Hora,Área,Rua,Posição,RZ,Volume\n';

  state.historicoExpedidos.forEach(exp => {
    exp.detalhes.forEach(d => {
      csv +=
        `"${exp.lote}",` +
        `"${exp.tipo}",` +
        `"${exp.data}",` +
        `"${exp.hora}",` +
        `"${d.area}",` +
        `"${d.rua}",` +
        `"${d.posicao}",` +
        `"${d.rz || ''}",` +
        `"${d.volume || ''}"\n`;
    });
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `expedicoes_${Date.now()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};
