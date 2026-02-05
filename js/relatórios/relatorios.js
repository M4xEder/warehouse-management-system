// =======================================
// RELATORIOS.JS — RELATÓRIOS DE EXPEDIÇÃO
// =======================================

console.log('relatorios.js carregado');

// ===============================
// POPULAR SELECT DE LOTES
// ===============================
function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  const lotesAtivos = state.lotes || [];
  const lotesHistorico = state.historicoExpedidos.map(h => h.lote);
  const todosLotes = Array.from(new Set([
    ...lotesAtivos.map(l => l.nome),
    ...lotesHistorico
  ]));

  todosLotes.forEach(nome => {
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
}

// ===============================
// FILTRAR POR RZ
// ===============================
window.filtrarPorRz = function(rz) {
  if (!rz) return;

  // Realce no mapa ou console log
  let encontrados = 0;
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.rz === rz) {
          console.log(`Encontrado: Lote ${pos.lote} | Área ${area.nome} | Rua ${rua.nome} | Pos ${pos.posicao}`);
          encontrados++;
        }
      });
    });
  });

  if (encontrados === 0) alert('Nenhum RZ encontrado');
};

// ===============================
// EXPORTAR RELATÓRIO EXCEL (TODOS LOTES)
// ===============================
window.exportarRelatorioExcel = function() {
  if (!state.lotes && !state.historicoExpedidos) {
    alert('Nenhum lote cadastrado');
    return;
  }

  const lotesAtivos = state.lotes || [];
  const lotesHistorico = state.historicoExpedidos.map(h => h.lote);
  const todosLotes = Array.from(new Set([
    ...lotesAtivos.map(l => l.nome),
    ...lotesHistorico
  ]));

  const wb = XLSX.utils.book_new();

  todosLotes.forEach(nomeLote => {
    const loteAtivo = state.lotes.find(l => l.nome === nomeLote);
    const expedicoes = state.historicoExpedidos.filter(h => h.lote === nomeLote);

    const linhas = [];

    // Cabeçalho
    linhas.push([
      'Tipo', 'Data', 'Hora', 'Área', 'Rua', 'Posição', 'RZ', 'Volume'
    ]);

    // Lotes ativos (alocados)
    if (loteAtivo) {
      state.areas.forEach(area => {
        area.ruas.forEach(rua => {
          rua.posicoes.forEach(pos => {
            if (pos.ocupada && pos.lote === nomeLote) {
              linhas.push([
                'Ativo',
                '-', '-', // Data e Hora
                area.nome,
                rua.nome,
                pos.posicao + 1,
                pos.rz || '-',
                pos.volume || '-'
              ]);
            }
          });
        });
      });
    }

    // Lotes expedidos
    expedicoes.forEach(exp => {
      exp.detalhes.forEach(d => {
        linhas.push([
          exp.tipo,
          exp.data,
          exp.hora,
          d.area,
          d.rua,
          d.posicao,
          d.rz || '-',
          d.volume || '-'
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(linhas);
    XLSX.utils.book_append_sheet(wb, ws, nomeLote.substring(0, 31)); // nome aba <=31 chars
  });

  const wbout = XLSX.write(wb, { bookType:'xlsx', type:'binary' });
  const blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_completo_${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
};

// ===============================
// EXPORTAR RELATÓRIO EXCEL (LOTE SELECIONADO)
// ===============================
window.exportarRelatorioLote = function() {
  const select = document.getElementById('selectLoteRelatorio');
  const nomeLote = select.value;

  if (!nomeLote) {
    alert('Selecione um lote');
    return;
  }

  const loteAtivo = state.lotes.find(l => l.nome === nomeLote);
  const expedicoes = state.historicoExpedidos.filter(h => h.lote === nomeLote);

  const linhas = [];
  linhas.push([
    'Tipo', 'Data', 'Hora', 'Área', 'Rua', 'Posição', 'RZ', 'Volume'
  ]);

  if (loteAtivo) {
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.ocupada && pos.lote === nomeLote) {
            linhas.push([
              'Ativo',
              '-', '-',
              area.nome,
              rua.nome,
              pos.posicao + 1,
              pos.rz || '-',
              pos.volume || '-'
            ]);
          }
        });
      });
    });
  }

  expedicoes.forEach(exp => {
    exp.detalhes.forEach(d => {
      linhas.push([
        exp.tipo,
        exp.data,
        exp.hora,
        d.area,
        d.rua,
        d.posicao,
        d.rz || '-',
        d.volume || '-'
      ]);
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(linhas);
  XLSX.utils.book_append_sheet(wb, ws, nomeLote.substring(0, 31));

  const wbout = XLSX.write(wb, { bookType:'xlsx', type:'binary' });
  const blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio_${nomeLote}_${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);

  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
};

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  popularSelectLotes();
});
