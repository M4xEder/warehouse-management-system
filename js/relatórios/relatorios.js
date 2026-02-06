// =======================================
// RELATORIOS.JS
// =======================================

document.addEventListener('DOMContentLoaded', () => {
  popularSelectLotes();
});

// -------------------------------
// POPULA SELECT DE LOTES
// -------------------------------
function popularSelectLotes() {
  const select = document.getElementById('selectLote');
  select.innerHTML = '<option value="">Selecione um lote</option><option value="todos">Todos</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
}

// -------------------------------
// GERAR RELATÓRIO
// -------------------------------
function gerarRelatorio() {
  const select = document.getElementById('selectLote');
  const loteSelecionado = select.value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumoDiv = document.getElementById('resumo');

  tbody.innerHTML = '';
  resumoDiv.style.display = 'none';
  resumoDiv.innerHTML = '';

  if (!loteSelecionado) return;

  const lotesFiltrados = loteSelecionado === 'todos'
    ? state.lotes
    : state.lotes.filter(l => l.nome === loteSelecionado);

  lotesFiltrados.forEach(lote => {
    let total = lote.total;
    let alocadas = 0;
    let naoAlocadas = 0;

    // Gaylords endereçadas
    const enderecadas = [];

    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.lote === lote.nome && pos.ocupada) {
            alocadas++;
            enderecadas.push({
              rz: pos.rz || '-',
              volume: pos.volume || '-',
              status: 'Ativa',
              area: area.nome,
              rua: rua.nome,
              data: '-',
              hora: '-'
            });
          } else if (pos.lote === lote.nome && !pos.rz && !pos.volume) {
            naoAlocadas++;
          }
        });
      });
    });

    // Gaylords expedidas
    const expedicoes = state.historicoExpedidos.filter(e => e.lote === lote.nome);

    expedicoes.forEach(exp => {
      exp.detalhes.forEach(d => {
        enderecadas.push({
          rz: d.rz || '-',
          volume: d.volume || '-',
          status: 'Expedida',
          area: d.area,
          rua: d.rua,
          data: exp.data,
          hora: exp.hora
        });
      });
    });

    // Preencher tabela
    enderecadas.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lote.nome}</td>
        <td>${d.rz}</td>
        <td>${d.volume}</td>
        <td>${d.status}</td>
        <td>${d.area}</td>
        <td>${d.rua}</td>
        <td>${d.data}</td>
        <td>${d.hora}</td>
      `;
      tbody.appendChild(tr);
    });

    // Resumo
    let resumoHTML = `<strong>Resumo do lote ${lote.nome}:</strong><br>`;
    resumoHTML += `Total gaylords: ${total}<br>`;
    resumoHTML += `Endereçadas ativas: ${alocadas}<br>`;
    resumoHTML += `Não endereçadas: ${naoAlocadas}<br>`;
    resumoHTML += `Expedições: ${expedicoes.length} vez(es)<br>`;
    resumoDiv.innerHTML = resumoHTML;
    resumoDiv.style.display = 'block';
  });
}

// -------------------------------
// EXPORTAR EXCEL
// -------------------------------
function exportarExcel() {
  const table = document.getElementById('tabelaRelatorio');
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Relatorio' });
  XLSX.writeFile(wb, 'relatorio.xlsx');
}

// -------------------------------
// EXPORTAR PDF
// -------------------------------
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');
  doc.setFontSize(10);
  doc.text('Relatório de Expedição', 40, 30);
  doc.autoTable({ html: '#tabelaRelatorio', startY: 50 });
  doc.save('relatorio.pdf');
}
