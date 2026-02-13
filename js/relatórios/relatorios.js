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
// POPULAR SELECT (MAPA + EXPEDIDOS)
// ===============================
function popularSelectLotes() {

  const select = document.getElementById('selectLote');
  if (!select) return;

  select.innerHTML = '<option value="">-- Selecione --</option>';

  const lotes = new Set();

  // Lotes ativos no mapa
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote) {
          lotes.add(pos.lote);
        }
      });
    });
  });

  // Lotes expedidos
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

  const { ativos, expedidos, dados } = montarDadosLote(loteSelecionado);

  if (dados.length === 0) {
    alert('Nenhum registro encontrado');
    return;
  }

  // Montar tabela
  dados.forEach(item => {

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.rz}</td>
      <td>${item.volume}</td>
      <td>${item.status}</td>
      <td>${item.area}</td>
      <td>${item.rua}</td>
      <td>${item.data}</td>
      <td>${item.hora}</td>
    `;

    tbody.appendChild(tr);
  });

  // Resumo
  const totalGeral = dados.length;
  const totalAtivos = ativos.length;
  const totalExpedidos = expedidos.length;
  const percentualExpedido = totalGeral > 0
    ? ((totalExpedidos / totalGeral) * 100).toFixed(1)
    : 0;

  resumo.innerHTML = `
    <strong>Lote:</strong> ${loteSelecionado} |
    <strong>Total geral:</strong> ${totalGeral} |
    <strong>Ativos:</strong> ${totalAtivos} |
    <strong>Expedidos:</strong> ${totalExpedidos} |
    <strong>% já expedido:</strong> ${percentualExpedido}%
  `;

  resumo.style.display = 'block';
};

// ===============================
// FUNÇÃO CENTRAL DE DADOS
// ===============================
function montarDadosLote(loteNome) {

  let ativos = [];
  let expedidos = [];

  // Ativos do mapa
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) {
          ativos.push({
            nome: pos.lote,
            rz: pos.rz || '-',
            volume: pos.volume || '-',
            status: 'ATIVO',
            area: area.nome,
            rua: rua.nome,
            data: pos.data || '-',
            hora: pos.hora || '-'
          });
        }
      });
    });
  });

  // Expedidos
  state.historicoExpedidos.forEach(item => {
    if (item.nome === loteNome) {
      expedidos.push({
        nome: item.nome,
        rz: item.rz || '-',
        volume: item.volume || '-',
        status: 'EXPEDIDO',
        area: item.area || '-',
        rua: item.rua || '-',
        data: item.data || '-',
        hora: item.hora || '-'
      });
    }
  });

  return {
    ativos,
    expedidos,
    dados: [...ativos, ...expedidos]
  };
}

// ===============================
// EXPORTAR EXCEL (LOTE SELECIONADO)
// ===============================
window.exportarExcelLote = function () {

  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) return;

  const { dados } = montarDadosLote(loteSelecionado);
  if (dados.length === 0) return;

  const ws = XLSX.utils.json_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, loteSelecionado.substring(0, 31));

  XLSX.writeFile(wb, `relatorio_${loteSelecionado}.xlsx`);
};

// ===============================
// EXPORTAR EXCEL (TODOS LOTES)
// ===============================
window.exportarExcelGeral = function () {

  const wb = XLSX.utils.book_new();
  const lotes = new Set();

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote) {
          lotes.add(pos.lote);
        }
      });
    });
  });

  state.historicoExpedidos.forEach(item => {
    lotes.add(item.nome);
  });

  if (lotes.size === 0) {
    alert("Nenhum lote encontrado.");
    return;
  }

  Array.from(lotes).forEach(loteNome => {

    const { dados } = montarDadosLote(loteNome);

    if (dados.length > 0) {
      const ws = XLSX.utils.json_to_sheet(dados);
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        loteNome.substring(0, 31)
      );
    }
  });

  XLSX.writeFile(wb, `relatorio_geral_lotes.xlsx`);
};

// ===============================
// EXPORTAR PDF
// ===============================
window.exportarPDF = function () {

  const loteSelecionado = document.getElementById('selectLote').value;
  if (!loteSelecionado) return;

  const { dados } = montarDadosLote(loteSelecionado);
  if (dados.length === 0) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text(`Relatório Geral - ${loteSelecionado}`, 14, 15);

  const rows = dados.map(item => [
    item.nome,
    item.rz,
    item.volume,
    item.status,
    item.area,
    item.rua,
    item.data,
    item.hora
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
