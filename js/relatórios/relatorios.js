// =======================================
// RELATORIOS.JS — LISTA DE LOTES E EXPORTAÇÃO
// =======================================

console.log('relatorios.js carregado');

// -------------------------------
// POPULA SELECT DE LOTES
// -------------------------------
function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  // Inclui todos os lotes cadastrados
  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
}

// -------------------------------
// EXPORTAR LOTE ESPECÍFICO PARA EXCEL
// -------------------------------
function exportarRelatorioLote() {
  const select = document.getElementById('selectLoteRelatorio');
  const loteNome = select.value;
  if (!loteNome) return alert('Selecione um lote');

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return alert('Lote não encontrado');

  const dados = [];

  // Gaylords alocadas
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) {
          dados.push({
            Tipo: 'Ativo',
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

  // Gaylords expedidas
  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === loteNome) {
      exp.detalhes.forEach(d => {
        dados.push({
          Tipo: 'Expedido',
          Área: d.area,
          Rua: d.rua,
          Posição: d.posicao,
          RZ: d.rz || '',
          Volume: d.volume || '',
          Data: exp.data,
          Hora: exp.hora
        });
      });
    }
  });

  // Não alocadas
  const alocadas = state.areas.flatMap(a => a.ruas.flatMap(r => r.posicoes))
    .filter(p => p.lote === loteNome).length;
  const expedidas = state.historicoExpedidos
    .filter(e => e.lote === loteNome)
    .reduce((acc, e) => acc + e.quantidadeExpedida, 0);
  const naoAlocadas = lote.total - (alocadas + expedidas);

  for (let i = 0; i < naoAlocadas; i++) {
    dados.push({
      Tipo: 'Não alocada',
      Área: '',
      Rua: '',
      Posição: '',
      RZ: '',
      Volume: ''
    });
  }

  // Criar planilha
  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, loteNome);
  XLSX.writeFile(wb, `Relatorio_${loteNome}.xlsx`);
}

// -------------------------------
// EXPORTAR TODOS LOTES PARA EXCEL
// -------------------------------
function exportarRelatorioExcel() {
  if (!state.lotes || state.lotes.length === 0) {
    return alert('Nenhum lote para exportar');
  }

  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const dados = [];

    // Alocadas
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.ocupada && pos.lote === lote.nome) {
            dados.push({
              Tipo: 'Ativo',
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

    // Expedidas
    state.historicoExpedidos.forEach(exp => {
      if (exp.lote === lote.nome) {
        exp.detalhes.forEach(d => {
          dados.push({
            Tipo: 'Expedido',
            Área: d.area,
            Rua: d.rua,
            Posição: d.posicao,
            RZ: d.rz || '',
            Volume: d.volume || '',
            Data: exp.data,
            Hora: exp.hora
          });
        });
      }
    });

    // Não alocadas
    const alocadas = state.areas.flatMap(a => a.ruas.flatMap(r => r.posicoes))
      .filter(p => p.lote === lote.nome).length;
    const expedidas = state.historicoExpedidos
      .filter(e => e.lote === lote.nome)
      .reduce((acc, e) => acc + e.quantidadeExpedida, 0);
    const naoAlocadas = lote.total - (alocadas + expedidas);

    for (let i = 0; i < naoAlocadas; i++) {
      dados.push({
        Tipo: 'Não alocada',
        Área: '',
        Rua: '',
        Posição: '',
        RZ: '',
        Volume: ''
      });
    }

    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, lote.nome);
  });

  XLSX.writeFile(wb, `Relatorios_Completos.xlsx`);
}

// -------------------------------
// INIT
// -------------------------------
window.addEventListener('DOMContentLoaded', () => {
  popularSelectLotes();
});
