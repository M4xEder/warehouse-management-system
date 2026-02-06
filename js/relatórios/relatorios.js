// =======================================
// RELATORIOS.JS — Relatórios detalhados
// =======================================

console.log('relatorios.js carregado');

// -------------------------------
// PREENCHE SELECT COM LOTES
// -------------------------------
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

// -------------------------------
// FILTRAR LOTE SELECIONADO
// -------------------------------
function filtrarLote() {
  const select = document.getElementById('selectLoteRelatorio');
  const loteNome = select.value.trim();

  if (!loteNome) return alert('Selecione um lote');

  renderResumo(loteNome);
  renderTabela(loteNome);
}

// -------------------------------
// RENDER RESUMO DO LOTE
// -------------------------------
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

  let html = `<div style="background:#f0f4f8;padding:10px;border-left:4px solid #2563eb;margin-bottom:12px;">
      <strong>Detalhes do Lote "${loteNome}"</strong><br>
      Total: ${total} gaylords<br>
      Expedidas: ${expedidas} (${parciais} parcial${parciais !== 1 ? 's' : ''})<br>
      Gaylords ativas: ${alocadas}<br>
      Não endereçadas: ${naoAlocadas}
  </div>`;

  resumo.innerHTML = html;
}

// -------------------------------
// RENDER TABELA
// -------------------------------
function renderTabela(loteNome) {
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  tbody.innerHTML = '';

  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return;

  // Gaylords alocadas
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${loteNome}</td>
            <td>${pos.rz || '-'}</td>
            <td>${pos.volume || '-'}</td>
            <td>Ativa</td>
            <td>${area.nome}</td>
            <td>${rua.nome}</td>
            <td>-</td>
            <td>-</td>
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
          <td>${loteNome}</td>
          <td>${d.rz || '-'}</td>
          <td>${d.volume || '-'}</td>
          <td>Expedida (${exp.tipo})</td>
          <td>${d.area}</td>
          <td>${d.rua}</td>
          <td>${exp.data}</td>
          <td>${exp.hora}</td>
        `;
        tbody.appendChild(tr);
      });
    });
}

// -------------------------------
// EXPORTAR EXCEL
// -------------------------------
function exportarExcel() {
  const table = document.getElementById('tabelaRelatorio');
  const wb = XLSX.utils.table_to_book(table, { sheet: "Lote" });
  XLSX.writeFile(wb, 'relatorio_lote.xlsx');
}

// -------------------------------
// EXPORTAR PDF
// -------------------------------
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');

  const table = document.getElementById('tabelaRelatorio');
  doc.html(table, {
    callback: function (doc) {
      doc.save('relatorio_lote.pdf');
    },
    margin: [20, 20, 20, 20],
    autoPaging: 'text',
    x: 10,
    y: 20
  });
}

// -------------------------------
// INICIALIZAÇÃO
// -------------------------------
window.addEventListener('load', () => {
  popularSelectLotes();
});
