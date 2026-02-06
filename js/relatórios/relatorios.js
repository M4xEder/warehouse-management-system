// =======================================
// RELATÓRIOS.JS — Tabela Horizontal + Export
// =======================================

// -------------------------------
// RENDER TABELA RELATÓRIO
// -------------------------------
window.renderTabelaRelatorio = function() {
  const tabela = document.getElementById('tabelaRelatorio').querySelector('tbody');
  tabela.innerHTML = '';

  const filtro = document.getElementById('selectLote').value;
  let lotesParaExibir = state.lotes;

  if (filtro) {
    lotesParaExibir = state.lotes.filter(l => l.nome === filtro);
  }

  lotesParaExibir.forEach(lote => {
    // Gaylords alocadas
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach((pos) => {
          if (pos.ocupada && pos.lote === lote.nome) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${lote.nome}</td>
              <td>${pos.rz || '-'}</td>
              <td>${pos.volume || '-'}</td>
              <td>Ativa</td>
              <td>${area.nome}</td>
              <td>${rua.nome}</td>
              <td>-</td>
              <td>-</td>
            `;
            tabela.appendChild(tr);
          }
        });
      });
    });

    // Gaylords expedidas
    state.historicoExpedidos.forEach(exp => {
      if (exp.lote === lote.nome) {
        exp.detalhes.forEach(d => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${lote.nome}</td>
            <td>${d.rz || '-'}</td>
            <td>${d.volume || '-'}</td>
            <td>Expedida (${exp.tipo})</td>
            <td>${d.area}</td>
            <td>${d.rua}</td>
            <td>${exp.data}</td>
            <td>${exp.hora}</td>
          `;
          tabela.appendChild(tr);
        });
      }
    });
  });
};

// -------------------------------
// FILTRO DE LOTE
// -------------------------------
window.filtrarTabela = function() {
  renderTabelaRelatorio();
};

// -------------------------------
// EXPORTAR EXCEL
// -------------------------------
window.exportarExcel = function() {
  const wb = XLSX.utils.book_new();
  const ws_data = [];
  const headers = ['Lote','RZ','Volume','Status','Área','Rua','Data','Hora'];
  ws_data.push(headers);

  const rows = document.querySelectorAll('#tabelaRelatorio tbody tr');
  rows.forEach(row => {
    const data = Array.from(row.children).map(td => td.textContent);
    ws_data.push(data);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  XLSX.writeFile(wb, 'RelatorioExpedicao.xlsx');
};

// -------------------------------
// EXPORTAR PDF
// -------------------------------
window.exportarPDF = function() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');

  doc.setFontSize(10);
  doc.text('Relatório de Expedição', 40, 30);

  const headers = [['Lote','RZ','Volume','Status','Área','Rua','Data','Hora']];
  const rows = [];

  document.querySelectorAll('#tabelaRelatorio tbody tr').forEach(tr => {
    rows.push(Array.from(tr.children).map(td => td.textContent));
  });

  if (rows.length === 0) {
    alert('Não há dados para gerar o PDF.');
    return;
  }

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 50,
    theme: 'grid',
    styles: { fontSize: 8 }
  });

  doc.save('RelatorioExpedicao.pdf');
};

// -------------------------------
// POPULAR SELECT LOTES
// -------------------------------
window.popularSelectLotes = function() {
  const select = document.getElementById('selectLote');
  if (!select) return;

  select.innerHTML = '<option value="">Todos os lotes</option>';
  state.lotes.forEach(l => {
    const option = document.createElement('option');
    option.value = l.nome;
    option.textContent = l.nome;
    select.appendChild(option);
  });
};

// -------------------------------
// INIT
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  popularSelectLotes();
  renderTabelaRelatorio();
});
