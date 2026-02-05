// =======================================
// RELATORIOS.JS — FILTRO, RENDER E EXPORTAÇÃO
// =======================================

console.log('relatorios.js carregado');

// ===============================
// POPULAR SELECT DE LOTES
// ===============================
function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
}

// ===============================
// RENDER RELATÓRIO NO HTML (OPCIONAL)
// ===============================
function renderRelatorioHTML(loteNome, filtroRz = '') {
  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  // Gaylords alocadas
  const alocadas = [];
  const naoAlocadas = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === loteNome && pos.ocupada) {
          if (!filtroRz || pos.rz === filtroRz) {
            alocadas.push({
              area: area.nome,
              rua: rua.nome,
              posicao: pos.posicao || '?',
              rz: pos.rz,
              volume: pos.volume
            });
          }
        } else if (pos.lote === loteNome && !pos.ocupada) {
          naoAlocadas.push({
            area: area.nome,
            rua: rua.nome,
            posicao: pos.posicao || '?'
          });
        }
      });
    });
  });

  // Gaylords expedidas
  const expedidas = state.historicoExpedidos.filter(h => h.lote === loteNome);

  // Mensagem parcial
  const msgParcial = expedidas.length > 1
    ? `Este lote teve ${expedidas.length - 1} expedições parciais antes da final`
    : '';

  // Saldo
  const totalAlocado = alocadas.length;
  const totalExpedido = expedidas.reduce((acc, h) => acc + h.quantidadeExpedida, 0);
  const totalNaoAlocado = naoAlocadas.length;
  const saldo = lote.total - totalExpedido - totalNaoAlocado;

  let html = `
    <h3>Lote: ${lote.nome}</h3>
    <p><strong>Total:</strong> ${lote.total} | 
       <strong>Alocadas:</strong> ${totalAlocado} | 
       <strong>Expedidas:</strong> ${totalExpedido} | 
       <strong>Não alocadas:</strong> ${totalNaoAlocado} | 
       <strong>Saldo:</strong> ${saldo}</p>
    ${msgParcial ? `<p style="color:#ca8a04">${msgParcial}</p>` : ''}
    <hr>
    <h4>Alocadas:</h4>
    <ul>
      ${alocadas.map(a => `<li>Área: ${a.area} | Rua: ${a.rua} | Posição: ${a.posicao} | RZ: ${a.rz} | Volume: ${a.volume || '-'}</li>`).join('')}
    </ul>
    <h4>Expedidas:</h4>
    <ul>
      ${expedidas.map(e => `<li>Data: ${e.data} ${e.hora} | Quantidade: ${e.quantidadeExpedida}</li>`).join('')}
    </ul>
    <h4>Não alocadas:</h4>
    <ul>
      ${naoAlocadas.map(n => `<li>Área: ${n.area} | Rua: ${n.rua} | Posição: ${n.posicao}</li>`).join('')}
    </ul>
  `;

  return html;
}

// ===============================
// EXPORTAR TODOS LOTES PARA EXCEL
// ===============================
window.exportarRelatorioExcel = function() {
  if (!state.lotes || state.lotes.length === 0) {
    alert('Nenhum lote disponível');
    return;
  }

  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const html = renderRelatorioHTML(lote.nome);
    const ws = XLSX.utils.table_to_sheet(
      new DOMParser().parseFromString(`<table>${html}</table>`, 'text/html').querySelector('table')
    );

    XLSX.utils.book_append_sheet(wb, ws, lote.nome.substring(0, 31));
  });

  XLSX.writeFile(wb, `relatorios_lotes_${Date.now()}.xlsx`);
};

// ===============================
// EXPORTAR LOTE ESPECÍFICO
// ===============================
window.exportarRelatorioLote = function() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  const loteNome = select.value;
  if (!loteNome) {
    alert('Selecione um lote');
    return;
  }

  const wb = XLSX.utils.book_new();

  const html = renderRelatorioHTML(loteNome);
  const ws = XLSX.utils.table_to_sheet(
    new DOMParser().parseFromString(`<table>${html}</table>`, 'text/html').querySelector('table')
  );

  XLSX.utils.book_append_sheet(wb, ws, loteNome.substring(0, 31));
  XLSX.writeFile(wb, `relatorio_lote_${loteNome}_${Date.now()}.xlsx`);
};

// ===============================
// FILTRO POR RZ
// ===============================
window.filtrarPorRz = function(rz) {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  const loteNome = select.value;
  if (!loteNome) return;

  const html = renderRelatorioHTML(loteNome, rz);
  // Aqui você pode exibir em um container no HTML se quiser
  console.log('Relatório filtrado por RZ', rz, html);
};

// ===============================
// POPULAR SELECT AO CARREGAR
// ===============================
window.addEventListener('load', popularSelectLotes);
