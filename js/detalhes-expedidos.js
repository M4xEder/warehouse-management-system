// ===============================
// DETALHES DO LOTE EXPEDIDO
// ===============================
window.verDetalhesLoteExpedido = function (nomeLote) {
  const historico = state.historicoExpedidos
    .filter(h => h.lote === nomeLote);

  if (historico.length === 0) {
    alert('Nenhum histórico encontrado');
    return;
  }

  let msg = `DETALHES DO LOTE: ${nomeLote}\n\n`;

  historico.forEach((exp, index) => {
    msg += `Expedição ${index + 1}\n`;
    msg += `Data: ${exp.data}\n`;
    msg += `Quantidade: ${exp.quantidadeExpedida}\n`;

    exp.gaylords.forEach(g => {
      msg += ` • RZ: ${g.rz} | Volume: ${g.volume || '-'}\n`;
    });

    msg += '\n';
  });

  if (historico.length > 1) {
    msg += `⚠ Este lote foi expedido ${historico.length} vezes.\n`;
  }

  const totalGaylords = historico.reduce(
    (s, h) => s + h.quantidadeExpedida, 0
  );

  msg += `\nLote completo contém ${totalGaylords} gaylords.`;

  alert(msg);
};
