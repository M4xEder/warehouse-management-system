// =======================================
// RELATORIOS-EXPEDICAO.JS
// Exportação de relatórios Excel
// =======================================

// -------------------------------
// EXPORTAR TODOS OU LOTES FILTRADOS
// -------------------------------
window.exportarRelatorioExcel = function (lotesFiltrados = null) {

  if (!state || !state.lotes || state.lotes.length === 0) {
    alert('Nenhum lote cadastrado');
    return;
  }

  const wb = XLSX.utils.book_new();

  const lotesParaExportar = lotesFiltrados
    ? state.lotes.filter(l => lotesFiltrados.includes(l.nome))
    : state.lotes;

  lotesParaExportar.forEach(lote => {
    const linhas = [];

    // ================= MAPA DE EXPEDIÇÕES =================
    const expedicoes = state.historicoExpedidos
      .filter(e => e.lote === lote.nome);

    const expedidosMap = {};

    expedicoes.forEach(exp => {
      exp.detalhes.forEach(d => {
        const chave = `${d.rz || ''}-${d.volume || ''}`;

        expedidosMap[chave] = {
          rz: d.rz || '',
          volume: d.volume || '',
          status:
            exp.tipo === 'TOTAL'
              ? 'Tudo expedido'
              : 'Expedido parcial',
          data: `${exp.data} ${exp.hora}`
        };
      });
    });

    // ================= GAYLORDS NÃO EXPEDIDAS =================
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (!pos.ocupada) return;
          if (pos.lote !== lote.nome) return;

          const chave = `${pos.rz || ''}-${pos.volume || ''}`;

          if (!expedidosMap[chave]) {
            expedidosMap[chave] = {
              rz: pos.rz || '',
              volume: pos.volume || '',
              status: 'Não expedido',
              data: ''
            };
          }
        });
      });
    });

    // ================= CONVERTE PARA PLANILHA =================
    Object.values(expedidosMap).forEach(item => {
      linhas.push({
        'RZ': item.rz,
        'Volume': item.volume,
        'Status': item.status,
        'Data da Expedição': item.data,
        'Total Gaylords do Lote': lote.total
      });
    });

    const ws = XLSX.utils.json_to_sheet(linhas);
    XLSX.utils.book_append_sheet(wb, ws, lote.nome);
  });

  const hoje = new Date().toISOString().split('T')[0];

  XLSX.writeFile(
    wb,
    lotesFiltrados
      ? `Relatorio_${lotesFiltrados[0]}_${hoje}.xlsx`
      : `Relatorio_Expedicao_${hoje}.xlsx`
  );
};

// -------------------------------
// EXPORTAR APENAS UM LOTE
// -------------------------------
window.exportarRelatorioLote = function () {
  const nomeLote =
    document.getElementById('selectLoteRelatorio').value;

  if (!nomeLote) {
    alert('Selecione um lote');
    return;
  }

  exportarRelatorioExcel([nomeLote]);
};

// -------------------------------
// POPULAR SELECT DE LOTES
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (!state || !state.lotes) return;

  const select =
    document.getElementById('selectLoteRelatorio');

  if (!select) return;

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
});
