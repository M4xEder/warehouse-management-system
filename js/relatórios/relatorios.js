window.filtrarTabela = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumoDiv = document.getElementById('resumoLote');
  
  tbody.innerHTML = '';
  resumoDiv.style.display = 'none';

  if (!loteSelecionado) return; // nada selecionado, não mostra nada

  if (loteSelecionado === 'todos') {
    // Percorrer todos os lotes
    state.lotes.forEach(lote => {
      renderLoteNaTabela(lote, tbody);
    });
    resumoDiv.style.display = 'none'; // sem resumo geral
  } else {
    const lote = state.lotes.find(l => l.nome === loteSelecionado);
    if (!lote) return;
    renderLoteNaTabela(lote, tbody);

    // Mostrar resumo do lote
    resumoDiv.style.display = 'block';
    resumoDiv.innerHTML = gerarResumo(loteSelecionado);
  }
};

// Função auxiliar para renderizar um lote na tabela
function renderLoteNaTabela(lote, tbody) {
  const nomeLote = lote.nome;

  // ativos
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === nomeLote && pos.ocupada) {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${nomeLote}</td>
            <td>${pos.rz || '-'}</td>
            <td>${pos.volume || '-'}</td>
            <td>Ativa</td>
            <td>${area.nome}</td>
            <td>${rua.nome}</td>
            <td>-</td>
            <td>-</td>
          `;
          tbody.appendChild(row);
        }
      });
    });
  });

  // expedidas
  const expeds = state.historicoExpedidos.filter(e => e.lote === nomeLote);
  expeds.forEach(exp => {
    exp.detalhes.forEach(d => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${nomeLote}</td>
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
}

// Função auxiliar para gerar resumo
function gerarResumo(loteSelecionado) {
  let total = 0, expedido = 0, parciais = 0, ativos = 0, naoAlocados = 0;

  const lote = state.lotes.find(l => l.nome === loteSelecionado);
  if (!lote) return '';

  total = lote.total;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === loteSelecionado && pos.ocupada) ativos++;
        else if (pos.lote === loteSelecionado && !pos.ocupada) naoAlocados++;
      });
    });
  });

  const expeds = state.historicoExpedidos.filter(e => e.lote === loteSelecionado);
  expeds.forEach(exp => {
    if (exp.tipo === 'PARCIAL') parciais++;
    else if (exp.tipo === 'TOTAL') expedido++;
  });

  return `
    <strong>Resumo do lote ${loteSelecionado}:</strong><br>
    Total gaylords: ${total}<br>
    Expedição completa: ${expedido} <br>
    Expedições parciais: ${parciais} <br>
    Gaylords ativas: ${ativos} <br>
    Gaylords não alocadas: ${naoAlocados}
  `;
}
