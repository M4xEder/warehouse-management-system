// =======================================
// RELATORIOS.JS — TABELA, RESUMO, EXPORTAÇÃO
// =======================================

document.addEventListener('DOMContentLoaded', () => {
  preencherSelectLotes();
  renderTabelaRelatorios();
});

// -------------------------------
// PREENCHER SELECT DE LOTES
// -------------------------------
function preencherSelectLotes() {
  const select = document.getElementById('selectLote');
  select.innerHTML = '<option value="">Todos os lotes</option>';

  state.lotes.forEach(lote => {
    const option = document.createElement('option');
    option.value = lote.nome;
    option.textContent = lote.nome;
    select.appendChild(option);
  });
}

// -------------------------------
// FILTRAR TABELA
// -------------------------------
function filtrarTabela() {
  renderTabelaRelatorios();
}

// -------------------------------
// RENDERIZAR TABELA
// -------------------------------
function renderTabelaRelatorios() {
  const tabela = document.getElementById('tabelaRelatorio').querySelector('tbody');
  tabela.innerHTML = '';

  const select = document.getElementById('selectLote');
  const filtro = select.value;

  const linhas = [];

  // -------------------------------
  // FUNÇÃO AUXILIAR PARA STATUS
  // -------------------------------
  function getStatus(pos) {
    return pos.ocupada ? 'Ativa' : 'Expedida';
  }

  // -------------------------------
  // PREENCHER LINHAS
  // -------------------------------
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (!pos.lote) return;
        if (filtro && pos.lote !== filtro) return;

        linhas.push({
          lote: pos.lote,
          rz: pos.rz || '-',
          volume: pos.volume || '-',
          status: getStatus(pos),
          area: area.nome,
          rua: rua.nome,
          data: '-', // Sem expedição
          hora: '-'
        });
      });
    });
  });

  // -------------------------------
  // PREENCHER EXPEDIÇÕES
  // -------------------------------
  state.historicoExpedidos.forEach(exp => {
    if (filtro && exp.lote !== filtro) return;

    exp.detalhes.forEach(d => {
      linhas.push({
        lote: exp.lote,
        rz: d.rz || '-',
        volume: d.volume || '-',
        status: exp.tipo === 'TOTAL' ? 'Expedida' : 'Parcial',
        area: d.area,
        rua: d.rua,
        data: exp.data,
        hora: exp.hora
      });
    });
  });

  // -------------------------------
  // ORDENAR POR LOTE, ÁREA, RUA
  // -------------------------------
  linhas.sort((a, b) => {
    if (a.lote !== b.lote) return a.lote.localeCompare(b.lote);
    if (a.area !== b.area) return a.area.localeCompare(b.area);
    if (a.rua !== b.rua) return a.rua.localeCompare(b.rua);
    return 0;
  });

  // -------------------------------
  // PREENCHER HTML
  // -------------------------------
  linhas.forEach(l => {
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
    tabela.appendChild(tr);
  });

  // -------------------------------
  // ATUALIZAR RESUMO
  // -------------------------------
  atualizarResumo(filtro);
}

// -------------------------------
// RESUMO DO LOTE
// -------------------------------
function atualizarResumo(filtro) {
  const resumoDiv = document.getElementById('resumoLote');

  if (!filtro) {
    resumoDiv.style.display = 'none';
    return;
  }

  const lote = state.lotes.find(l => l.nome === filtro);
  if (!lote) {
    resumoDiv.style.display = 'none';
    return;
  }

  const expeds = state.historicoExpedidos.filter(e => e.lote === filtro);
  const totalExp = expeds.reduce((acc, e) => acc + e.quantidadeExpedida, 0);
  const parciais = expeds.filter(e => e.tipo === 'PARCIAL').length;
  const primeira = expeds[0];
  const ultima = expeds[expeds.length - 1];

  const naoAlocadas = contarNaoAlocadas(filtro);
  const ativas = contarAtivas(filtro);

  let html = `<strong>Resumo do Lote "${filtro}"</strong><br>`;
  html += `Total de gaylords: ${lote.total}<br>`;
  html += `Expedições parciais: ${parciais}<br>`;

  if (expeds.length > 0) {
    html += `Primeira expedição: ${primeira.quantidadeExpedida} gaylords - ${primeira.data} ${primeira.hora}<br>`;
    if (expeds.length > 1) {
      for (let i = 1; i < expeds.length; i++) {
        const e = expeds[i];
        html += `Expedição ${i + 1}: ${e.quantidadeExpedida} gaylords - ${e.data} ${e.hora}<br>`;
      }
    }
  }

  html += `Gaylords não alocadas: ${naoAlocadas}<br>`;
  html += `Gaylords ativas: ${ativas}<br>`;

  if (totalExp >= lote.total) {
    html += `<strong style="color:#16a34a">Lote expedido por completo</strong>`;
  }

  resumoDiv.innerHTML = html;
  resumoDiv.style.display = 'block';
}

// -------------------------------
// CONTAGEM AUXILIAR
// -------------------------------
function contarNaoAlocadas(lote) {
  let count = 0;
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === lote && !pos.rz && !pos.volume) count++;
      });
    });
  });
  return count;
}

function contarAtivas(lote) {
  let count = 0;
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === lote && pos.ocupada) count++;
      });
    });
  });
  return count;
}

// -------------------------------
// EXPORTAR EXCEL
// -------------------------------
function exportarExcel() {
  const tabela = document.getElementById('tabelaRelatorio');
  const wb = XLSX.utils.table_to_book(tabela, { sheet: "Relatorio" });
  XLSX.writeFile(wb, "relatorio_expedicao.xlsx");
}

// -------------------------------
// EXPORTAR PDF
// -------------------------------
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'pt', 'a4');

  doc.setFontSize(12);
  doc.text("Relatório de Expedição", 40, 40);

  doc.autoTable({ html: '#tabelaRelatorio', startY: 60 });
  doc.save('relatorio_expedicao.pdf');
}
