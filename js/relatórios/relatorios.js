/* // =======================================
// RELATORIOS.JS — RELATÓRIO GERAL
// =======================================

console.log('relatorios.js carregado');

// ===============================
// INICIALIZAÇÃO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  checarSessao();
  loadState();
  popularSelectLotes();
});

// ===============================
// VOLTAR PARA O SISTEMA
// ===============================
window.voltarSistema = function () {
  window.location.href = 'index.html';
};

// ===============================
// POPULAR SELECT DE LOTES (ATIVOS + EXPEDIDOS)
// ===============================
function popularSelectLotes() {
  const select = document.getElementById('selectLote');
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecione --</option>';

  const lotes = new Set();

  // Lotes ativos
  state.lotes.forEach(item => {
    lotes.add(item.lote);
  });

  // Lotes expedidos
  state.historicoExpedidos.forEach(item => {
    lotes.add(item.lote);
  });

  Array.from(lotes)
    .sort()
    .forEach(lote => {
      const opt = document.createElement('option');
      opt.value = lote;
      opt.textContent = lote;
      select.appendChild(opt);
    });
}

// ===============================
// GERAR RELATÓRIO (ATIVOS + EXPEDIDOS)
// ===============================
window.gerarRelatorio = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumo = document.getElementById('resumo');

  tbody.innerHTML = '';
  resumo.style.display = 'none';

  if (!loteSelecionado) {
    alert('Selecione um lote');
    return;
  }

  // Buscar ativos
  const ativos = state.lotes.filter(
    item => item.lote === loteSelecionado
  );

  // Buscar expedidos
  const expedidos = state.historicoExpedidos.filter(
    item => item.lote === loteSelecionado
  );

  const dados = [...ativos, ...expedidos];

  if (dados.length === 0) {
    alert('Nenhum registro encontrado para este lote');
    return;
  }

  let totalVolume = 0;

  dados.forEach(item => {
    totalVolume += Number(item.volume || 0);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.lote || ''}</td>
      <td>${item.rz || ''}</td>
      <td>${item.volume || ''}</td>
      <td>${item.status || (ativos.includes(item) ? 'ATIVO' : 'EXPEDIDO')}</td>
      <td>${item.area || ''}</td>
      <td>${item.rua || ''}</td>
      <td>${item.data || '-'}</td>
      <td>${item.hora || '-'}</td>
    `;
    tbody.appendChild(tr);
  });

  resumo.innerHTML = `
    <strong>Lote:</strong> ${loteSelecionado} |
    <strong>Registros:</strong> ${dados.length} |
    <strong>Volume total:</strong> ${totalVolume}
  `;
  resumo.style.display = 'block';
};

// ===============================
// EXPORTAR EXCEL
// ===============================
window.exportarExcel = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) {
    alert('Selecione um lote');
    return;
  }

  const ativos = state.lotes.filter(item => item.lote === loteSelecionado);
  const expedidos = state.historicoExpedidos.filter(item => item.lote === loteSelecionado);

  const dados = [...ativos, ...expedidos];
  if (dados.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

  XLSX.writeFile(wb, `relatorio_${loteSelecionado}.xlsx`);
};

// ===============================
// EXPORTAR PDF
// ===============================
window.exportarPDF = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) {
    alert('Selecione um lote');
    return;
  }

  const ativos = state.lotes.filter(item => item.lote === loteSelecionado);
  const expedidos = state.historicoExpedidos.filter(item => item.lote === loteSelecionado);

  const dados = [...ativos, ...expedidos];
  if (dados.length === 0) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Relatório Geral - Lote ${loteSelecionado}`, 14, 15);

  const rows = dados.map(item => [
    item.lote,
    item.rz,
    item.volume,
    item.status || (ativos.includes(item) ? 'ATIVO' : 'EXPEDIDO'),
    item.area,
    item.rua,
    item.data || '-',
    item.hora || '-'
  ]);

  doc.autoTable({
    startY: 22,
    head: [[
      'Lote',
      'RZ',
      'Volume',
      'Status',
      'Área',
      'Rua',
      'Data',
      'Hora'
    ]],
    body: rows
  });

  doc.save(`relatorio_${loteSelecionado}.pdf`);
  
};

*/

// =======================================
// RELATORIOS.JS — RELATÓRIO GERAL
// =======================================

console.log('relatorios.js carregado');

document.addEventListener('DOMContentLoaded', () => {
  checarSessao();
  loadState();
  popularSelectLotes();
});

// ===============================
// POPULAR SELECT (ATIVOS + EXPEDIDOS)
// ===============================
function popularSelectLotes() {
  const select = document.getElementById('selectLote');
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecione --</option>';

  const lotes = new Set();

  state.lotes.forEach(item => {
    lotes.add(item.nome);
  });

  state.historicoExpedidos.forEach(item => {
    lotes.add(item.nome);
  });

  Array.from(lotes)
    .sort()
    .forEach(nome => {
      const opt = document.createElement('option');
      opt.value = nome;
      opt.textContent = nome;
      select.appendChild(opt);
    });
}

// ===============================
// GERAR RELATÓRIO
// ===============================
window.gerarRelatorio = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumo = document.getElementById('resumo');

  tbody.innerHTML = '';
  resumo.style.display = 'none';

  if (!loteSelecionado) {
    alert('Selecione um lote');
    return;
  }

  const ativos = state.lotes.filter(
    item => item.nome === loteSelecionado
  );

  const expedidos = state.historicoExpedidos.filter(
    item => item.nome === loteSelecionado
  );

  const dados = [...ativos, ...expedidos];

  if (dados.length === 0) {
    alert('Nenhum registro encontrado');
    return;
  }

  let totalVolume = 0;

  dados.forEach(item => {

    totalVolume += Number(item.volume || 0);

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.rz || '-'}</td>
      <td>${item.volume || item.total || '-'}</td>
      <td>${item.status || 'ATIVO'}</td>
      <td>${item.area || '-'}</td>
      <td>${item.rua || '-'}</td>
      <td>${item.data || '-'}</td>
      <td>${item.hora || '-'}</td>
    `;

    tbody.appendChild(tr);
  });

  resumo.innerHTML = `
    <strong>Lote:</strong> ${loteSelecionado} |
    <strong>Registros:</strong> ${dados.length} |
    <strong>Volume total:</strong> ${totalVolume}
  `;

  resumo.style.display = 'block';
};

// ===============================
// EXPORTAR EXCEL
// ===============================
window.exportarExcel = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) return;

  const dados = [
    ...state.lotes.filter(l => l.nome === loteSelecionado),
    ...state.historicoExpedidos.filter(l => l.nome === loteSelecionado)
  ];

  if (dados.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

  XLSX.writeFile(wb, `relatorio_${loteSelecionado}.xlsx`);
};

// ===============================
// EXPORTAR PDF
// ===============================
window.exportarPDF = function () {
  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) return;

  const dados = [
    ...state.lotes.filter(l => l.nome === loteSelecionado),
    ...state.historicoExpedidos.filter(l => l.nome === loteSelecionado)
  ];

  if (dados.length === 0) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Relatório Geral - ${loteSelecionado}`, 14, 15);

  const rows = dados.map(item => [
    item.nome,
    item.rz || '-',
    item.volume || item.total || '-',
    item.status || 'ATIVO',
    item.area || '-',
    item.rua || '-',
    item.data || '-',
    item.hora || '-'
  ]);

  doc.autoTable({
    startY: 22,
    head: [[
      'Lote',
      'RZ',
      'Volume',
      'Status',
      'Área',
      'Rua',
      'Data',
      'Hora'
    ]],
    body: rows
  });

  doc.save(`relatorio_${loteSelecionado}.pdf`);
};
