// =======================================
// RELATORIOS.JS — CONTROLE DE RELATÓRIOS
// =======================================

console.log('relatorios.js carregado');

// -------------------------------
// POPULAR SELECT COM LOTES
// -------------------------------
function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  // Todos os lotes: ativos + expedidos
  const lotes = [...state.lotes];
  state.historicoExpedidos.forEach(exp => {
    if (!lotes.some(l => l.nome === exp.lote)) {
      lotes.push({ nome: exp.lote });
    }
  });

  lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
}

// -------------------------------
// EXPORTAR LOTE ESPECÍFICO
// -------------------------------
window.exportarRelatorioLote = function() {
  const select = document.getElementById('selectLoteRelatorio');
  const loteNome = select.value.trim();

  if (!loteNome) {
    alert('Selecione um lote para exportar');
    return;
  }

  const wb = XLSX.utils.book_new();

  // -------------------------------
  // Dados do lote ativo
  const ativos = [];
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) {
          ativos.push({
            Área: area.nome,
            Rua: rua.nome,
            Posição: pos.posicao,
            RZ: pos.rz || '',
            Volume: pos.volume || ''
          });
        }
      });
    });
  });

  const wsAtivos = XLSX.utils.json_to_sheet(ativos);
  XLSX.utils.book_append_sheet(wb, wsAtivos, 'Ativos');

  // -------------------------------
  // Dados de expedição
  const expedidos = [];
  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === loteNome) {
      exp.detalhes.forEach(d => {
        expedidos.push({
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
    }
  });

  const wsExpedidos = XLSX.utils.json_to_sheet(expedidos);
  XLSX.utils.book_append_sheet(wb, wsExpedidos, 'Expedidos');

  // -------------------------------
  // Resumo
  const totalLote = state.lotes.find(l => l.nome === loteNome)?.total || 0;
  const alocadas = ativos.length;
  const expedidasQtd = expedidos.length;
  const saldo = totalLote - expedidasQtd;
  const naoAlocadas = Math.max(totalLote - (alocadas + expedidasQtd), 0);

  const resumo = [
    {
      'Total do lote': totalLote,
      'Alocadas': alocadas,
      'Expedidas': expedidasQtd,
      'Não alocadas': naoAlocadas,
      'Saldo': saldo
    }
  ];

  const wsResumo = XLSX.utils.json_to_sheet(resumo);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  XLSX.writeFile(wb, `relatorio_${loteNome}_${Date.now()}.xlsx`);
};

// -------------------------------
// EXPORTAR TODOS OS LOTES
// -------------------------------
window.exportarRelatorioExcel = function() {
  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    // Dados ativos
    const ativos = [];
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.ocupada && pos.lote === lote.nome) {
            ativos.push({
              Área: area.nome,
              Rua: rua.nome,
              Posição: pos.posicao,
              RZ: pos.rz || '',
              Volume: pos.volume || ''
            });
          }
        });
      });
    });
    const wsAtivos = XLSX.utils.json_to_sheet(ativos);
    XLSX.utils.book_append_sheet(wb, wsAtivos, `${lote.nome}-Ativos`);

    // Dados expedidos
    const expedidos = [];
    state.historicoExpedidos.forEach(exp => {
      if (exp.lote === lote.nome) {
        exp.detalhes.forEach(d => {
          expedidos.push({
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
      }
    });
    const wsExpedidos = XLSX.utils.json_to_sheet(expedidos);
    XLSX.utils.book_append_sheet(wb, wsExpedidos, `${lote.nome}-Expedidos`);

    // Resumo
    const totalLote = lote.total;
    const alocadas = ativos.length;
    const expedidasQtd = expedidos.length;
    const saldo = totalLote - expedidasQtd;
    const naoAlocadas = Math.max(totalLote - (alocadas + expedidasQtd), 0);

    const resumo = [
      {
        'Total do lote': totalLote,
        'Alocadas': alocadas,
        'Expedidas': expedidasQtd,
        'Não alocadas': naoAlocadas,
        'Saldo': saldo
      }
    ];
    const wsResumo = XLSX.utils.json_to_sheet(resumo);
    XLSX.utils.book_append_sheet(wb, wsResumo, `${lote.nome}-Resumo`);
  });

  XLSX.writeFile(wb, `relatorio_completo_${Date.now()}.xlsx`);
};

// -------------------------------
// INIT
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  popularSelectLotes();
});
