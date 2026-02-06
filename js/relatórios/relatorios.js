// =======================================
// RELATORIOS.JS — Exportação e filtro
// =======================================

// -------------------------------
// POPULAR SELECT COM LOTES
// -------------------------------
window.popularSelectLotes = function () {
  const select = document.getElementById('selectLote');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  state.lotes.forEach(lote => {
    const option = document.createElement('option');
    option.value = lote.nome;
    option.textContent = lote.nome;
    select.appendChild(option);
  });
};

// -------------------------------
// FILTRAR TABELA
// -------------------------------
window.filtrarTabela = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumoDiv = document.getElementById('resumoLote');
  tbody.innerHTML = '';
  resumoDiv.style.display = 'none';
  if (!loteSelecionado) return;

  const lote = state.lotes.find(l => l.nome === loteSelecionado);
  if (!lote) return;

  let total = lote.total;
  let expedido = 0;
  let parciais = 0;
  let naoAlocados = 0;
  let ativos = 0;

  // gaylords endereçadas
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteSelecionado) {
          ativos++;
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${loteSelecionado}</td>
            <td>${pos.rz || '-'}</td>
            <td>${pos.volume || '-'}</td>
            <td>Ativa</td>
            <td>${area.nome}</td>
            <td>${rua.nome}</td>
            <td>-</td>
            <td>-</td>
          `;
          tbody.appendChild(row);
        } else if (pos.lote === loteSelecionado && !pos.ocupada) {
          naoAlocados++;
        }
      });
    });
  });

  // gaylords expedidas
  const expeds = state.historicoExpedidos.filter(e => e.lote === loteSelecionado);
  expeds.forEach(exp => {
    if (exp.tipo === 'PARCIAL') parciais++;
    else if (exp.tipo === 'TOTAL') expedido++;

    exp.detalhes.forEach(d => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${loteSelecionado}</td>
        <td>${d.rz || '-'}</td>
        <td>${d.volume || '-'}</td>
        <td>Expedida</td>
        <td>${d.area}</td>
        <td>${d.rua}</td>
        <td>${exp.data}</td>
        <td>${exp.hora}</td>
      `;
      tbody.appendChild(row);
    });
  });

  // resumo
  resumoDiv.style.display = 'block';
  let resumoHtml = `<strong>Resumo do lote ${loteSelecionado}:</strong><br>`;
  resumoHtml += `Total gaylords: ${total} <br>`;
  resumoHtml += `Expedido total: ${expedido} <br>`;
  resumoHtml += `Expedições parciais: ${parciais} <br>`;
  resumoHtml += `Gaylords ativas: ${ativos} <br>`;
  resumoHtml += `Gaylords não alocadas: ${naoAlocados}`;
  resumoDiv.innerHTML = resumoHtml;
};

// -------------------------------
// EXPORTAR LOTE INDIVIDUAL
// -------------------------------
window.exportarLoteExcel = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) return alert('Selecione um lote');

  const wsData = [];
  wsData.push(['Lote','RZ','Volume','Status','Área','Rua','Data','Hora']);

  // ativos
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === loteSelecionado && pos.ocupada) {
          wsData.push([
            loteSelecionado,
            pos.rz || '-',
            pos.volume || '-',
            'Ativa',
            area.nome,
            rua.nome,
            '-',
            '-'
          ]);
        }
      });
    });
  });

  // expedidas
  const expeds = state.historicoExpedidos.filter(e => e.lote === loteSelecionado);
  expeds.forEach(exp => {
    exp.detalhes.forEach(d => {
      wsData.push([
        loteSelecionado,
        d.rz || '-',
        d.volume || '-',
        'Expedida',
        d.area,
        d.rua,
        exp.data,
        exp.hora
      ]);
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, loteSelecionado);
  XLSX.writeFile(wb, `Lote_${loteSelecionado}.xlsx`);
};

// -------------------------------
// EXPORTAR TODOS LOTES
// -------------------------------
window.exportarTodosLotesExcel = function () {
  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const wsData = [];
    wsData.push(['Lote','RZ','Volume','Status','Área','Rua','Data','Hora']);

    // ativos
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.lote === lote.nome && pos.ocupada) {
            wsData.push([
              lote.nome,
              pos.rz || '-',
              pos.volume || '-',
              'Ativa',
              area.nome,
              rua.nome,
              '-',
              '-'
            ]);
          }
        });
      });
    });

    // expedidas
    const expeds = state.historicoExpedidos.filter(e => e.lote === lote.nome);
    expeds.forEach(exp => {
      exp.detalhes.forEach(d => {
        wsData.push([
          lote.nome,
          d.rz || '-',
          d.volume || '-',
          'Expedida',
          d.area,
          d.rua,
          exp.data,
          exp.hora
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, lote.nome);
  });

  XLSX.writeFile(wb, `Todos_Lotes.xlsx`);
};
