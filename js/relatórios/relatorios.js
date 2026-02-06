// =======================================
// RELATORIOS.JS — VERSÃO ESTÁVEL
// =======================================

let dadosRelatorio = []; // usado por Excel e PDF

// -------------------------------
// AGUARDA STATE
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  aguardarState();
});

function aguardarState() {
  if (!window.state || !Array.isArray(state.lotes)) {
    setTimeout(aguardarState, 100);
    return;
  }
  popularSelectLotes();
}

// -------------------------------
// POPULA SELECT
// -------------------------------
function popularSelectLotes() {
  const select = document.getElementById('selectLote');
  if (!select) return;

  select.innerHTML = `
    <option value="">Selecione um lote</option>
    <option value="todos">Todos</option>
  `;

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
  const loteSelecionado = document.getElementById('selectLote').value;
  const tbody = document.querySelector('#tabelaRelatorio tbody');
  const resumo = document.getElementById('resumo');

  tbody.innerHTML = '';
  resumo.style.display = 'none';
  resumo.innerHTML = '';
  dadosRelatorio = [];

  if (!loteSelecionado) return;

  const lotes =
    loteSelecionado === 'todos'
      ? state.lotes
      : state.lotes.filter(l => l.nome === loteSelecionado);

  lotes.forEach(lote => {
    const registros = gerarDadosDoLote(lote);

    registros.linhas.forEach(l => {
      dadosRelatorio.push(l);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${l.lote}</td>
        <td>${l.rz}</td>
        <td>${l.volume}</td>
        <td>${l.status}</td>
        <td>${l.area}</td>
        <td>${l.rua}</td>
        <td>${l.data}</td>
        <td>${l.hora}</td>
      `;
      tbody.appendChild(tr);
    });

    resumo.innerHTML += `
      <strong>Lote ${lote.nome}</strong><br>
      Total: ${registros.total}<br>
      Ativas: ${registros.ativas}<br>
      Não endereçadas: ${registros.naoEnderecadas}<br>
      Expedições: ${registros.expedicoes}<br><br>
    `;
  });

  resumo.style.display = 'block';
}

// -------------------------------
// GERAR DADOS DO LOTE
// -------------------------------
function gerarDadosDoLote(lote) {
  const linhas = [];
  let ativas = 0;
  let naoEnderecadas = 0;

  // ATIVAS
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === lote.nome && pos.ocupada) {
          ativas++;
          linhas.push({
            lote: lote.nome,
            rz: pos.rz || '-',
            volume: pos.volume || '-',
            status: 'Ativa',
            area: area.nome,
            rua: rua.nome,
            data: '-',
            hora: '-'
          });
        }

        if (pos.lote === lote.nome && !pos.rz && !pos.volume) {
          naoEnderecadas++;
        }
      });
    });
  });

  // EXPEDIDAS
  const expedicoes = state.historicoExpedidos.filter(e => e.lote === lote.nome);

  expedicoes.forEach(exp => {
    exp.detalhes.forEach(d => {
      linhas.push({
        lote: lote.nome,
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

  return {
    linhas,
    total: lote.total,
    ativas,
    naoEnderecadas,
    expedicoes: expedicoes.length
  };
}

// -------------------------------
// EXPORTAR EXCEL (INTELIGENTE)
// -------------------------------
function exportarExcel() {
  if (dadosRelatorio.length === 0) {
    alert('Gere o relatório primeiro');
    return;
  }

  const wb = XLSX.utils.book_new();

  const grupos = {};

  dadosRelatorio.forEach(l => {
    if (!grupos[l.lote]) grupos[l.lote] = [];
    grupos[l.lote].push(l);
  });

  Object.keys(grupos).forEach(lote => {
    const ws = XLSX.utils.json_to_sheet(grupos[lote]);
    XLSX.utils.book_append_sheet(wb, ws, lote.substring(0, 31));
  });

  XLSX.writeFile(wb, 'relatorio_lotes.xlsx');
}

// -------------------------------
// EXPORTAR PDF (ESTÁVEL)
// -------------------------------
function exportarPDF() {
  if (dadosRelatorio.length === 0) {
    alert('Gere o relatório primeiro');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');

  doc.text('Relatório de Expedição', 40, 30);

  doc.autoTable({
    head: [[
      'Lote', 'RZ', 'Volume', 'Status',
      'Área', 'Rua', 'Data', 'Hora'
    ]],
    body: dadosRelatorio.map(l => [
      l.lote, l.rz, l.volume, l.status,
      l.area, l.rua, l.data, l.hora
    ]),
    startY: 50,
    styles: { fontSize: 8 },
    margin: { left: 30, right: 30 }
  });

  doc.save('relatorio.pdf');
}
