console.log('relatorios.js carregado');

function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  select.innerHTML = '<option value="">Selecione um lote</option>';
  state.lotes.forEach(lote => {
    const option = document.createElement('option');
    option.value = lote.nome;
    option.textContent = lote.nome;
    select.appendChild(option);
  });
}

function filtrarLote() {
  const loteNome = document.getElementById('selectLoteRelatorio').value.trim();
  if (!loteNome) return alert('Selecione um lote');
  renderResumo(loteNome);
  renderTabela(loteNome);
}

function renderResumo(loteNome) {
  const resumo = document.getElementById('resumoLote');
  resumo.innerHTML = '';
  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return;

  const total = lote.total;
  const alocadas = state.areas.reduce((acc, area) => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) acc++;
      });
    });
    return acc;
  }, 0);

  const expedidas = state.historicoExpedidos
    .filter(e => e.lote === loteNome)
    .reduce((acc, e) => acc + e.quantidadeExpedida, 0);

  const parciais = state.historicoExpedidos
    .filter(e => e.lote === loteNome && e.tipo === 'PARCIAL')
    .length;

  const naoAlocadas = total - (alocadas + expedidas);

  resumo.innerHTML = `<div>
      <strong>Detalhes do Lote "${loteNome}"</strong><br>
      Total: ${total} gaylords<br>
      Expedidas: ${expedidas} (${parciais} parcial${parciais !== 1 ? 's' : ''})<br>
      Gaylords ativas: ${alocadas}<br>
      Não endereçadas: ${naoAlocadas}
  </div>`;
}

function renderTabela(loteNome) {
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  tbody.innerHTML = '';

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return;

  // Gaylords ativas
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td data-label="Lote">${loteNome}</td>
            <td data-label="RZ">${pos.rz || '-'}</td>
            <td data-label="Volume">${pos.volume || '-'}</td>
            <td data-label="Status">Ativa</td>
            <td data-label="Área">${area.nome}</td>
            <td data-label="Rua">${rua.nome}</td>
            <td data-label="Data">-</td>
            <td data-label="Hora">-</td>
          `;
          tbody.appendChild(tr);
        }
      });
    });
  });

  // Gaylords expedidas
  state.historicoExpedidos
    .filter(e => e.lote === loteNome)
    .forEach(exp => {
      exp.detalhes.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td data-label="Lote">${loteNome}</td>
          <td data-label="RZ">${d.rz || '-'}</td>
          <td data-label="Volume">${d.volume || '-'}</td>
          <td data-label="Status">Expedida (${exp.tipo})</td>
          <td data-label="Área">${d.area}</td>
          <td data-label="Rua">${d.rua}</td>
          <td data-label="Data">${exp.data}</td>
          <td data-label="Hora">${exp.hora}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

function exportarExcel() {
  const table = document.getElementById('tabelaRelatorio');
  const wb = XLSX.utils.table_to_book(table, { sheet: "Lote" });
  XLSX.writeFile(wb, 'relatorio_lote.xlsx');
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("Relatório de Expedição", 14, 20);

  doc.autoTable({
    html: '#tabelaRelatorio',
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 }
  });

  doc.save('relatorio_lote.pdf');
}

window.addEventListener('load', () => {
  popularSelectLotes();
});
