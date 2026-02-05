// =======================================
// RELATORIOS.JS — RELATÓRIOS DE EXPEDIÇÃO
// =======================================

console.log('relatorios.js carregado');

// ===============================
// POPULA SELECT DE LOTES
// ===============================
function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  // Inclui lotes ativos e lotes que já tiveram expedição
  const nomesLotes = new Set();

  state.lotes.forEach(l => nomesLotes.add(l.nome));
  state.historicoExpedidos.forEach(e => nomesLotes.add(e.lote));

  nomesLotes.forEach(nome => {
    const opt = document.createElement('option');
    opt.value = nome;
    opt.textContent = nome;
    select.appendChild(opt);
  });
}

// ===============================
// GERAR RELATÓRIO DE UM LOTE
// ===============================
function gerarRelatorioDoLote(nomeLote, filtroRZ = '') {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return null;

  const total = lote.total;

  // Alocadas no mapa
  let alocadasDetalhes = [];
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          if (!filtroRZ || (pos.rz && pos.rz.includes(filtroRZ))) {
            alocadasDetalhes.push({
              area: area.nome,
              rua: rua.nome,
              posicao: pos.posicao,
              rz: pos.rz || '',
              volume: pos.volume || ''
            });
          }
        }
      });
    });
  });

  const alocadas = alocadasDetalhes.length;

  // Expedidas
  const expedicoes = state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .map(e => ({
      id: e.id,
      data: e.data,
      hora: e.hora,
      tipo: e.tipo,
      quantidadeExpedida: e.quantidadeExpedida,
      quantidadeTotal: e.quantidadeTotal,
      detalhes: e.detalhes
    }));

  let expedidas = 0;
  expedicoes.forEach(e => expedidas += e.quantidadeExpedida);

  const naoAlocadas = Math.max(total - (alocadas + expedidas), 0);

  const parciaisAntes = expedicoes.filter(e => e.tipo === 'PARCIAL').length;

  return {
    nome: nomeLote,
    total,
    alocadasDetalhes,
    alocadas,
    expedicoes,
    expedidas,
    naoAlocadas,
    parciaisAntes
  };
}

// ===============================
// EXPORTAR LOTE ESPECÍFICO PARA EXCEL
// ===============================
window.exportarRelatorioLote = function() {
  const select = document.getElementById('selectLoteRelatorio');
  const filtroRZ = prompt('Filtrar por RZ (opcional, deixe vazio para todos)') || '';
  const nomeLote = select.value;

  if (!nomeLote) return alert('Selecione um lote');

  const rel = gerarRelatorioDoLote(nomeLote, filtroRZ);
  if (!rel) return alert('Lote não encontrado');

  const wb = XLSX.utils.book_new();

  // 1️⃣ Aba: Lote ativo
  const ativosData = rel.alocadasDetalhes.map(d => ({
    Área: d.area,
    Rua: d.rua,
    Posição: d.posicao,
    RZ: d.rz,
    Volume: d.volume
  }));
  ativosData.unshift({Área:'Área',Rua:'Rua',Posição:'Posição',RZ:'RZ',Volume:'Volume'}); // cabeçalho
  const wsAtivos = XLSX.utils.json_to_sheet(ativosData, {skipHeader:true});
  XLSX.utils.book_append_sheet(wb, wsAtivos, 'Lote Ativo');

  // 2️⃣ Aba: Expedidas
  const expedidasData = [];
  rel.expedicoes.forEach(e => {
    e.detalhes.forEach((d, i) => {
      expedidasData.push({
        ID_Expedicao: e.id,
        Tipo: e.tipo,
        Data: e.data,
        Hora: e.hora,
        Área: d.area,
        Rua: d.rua,
        Posição: d.posicao,
        RZ: d.rz || '',
        Volume: d.volume || ''
      });
    });
  });
  const wsExp = XLSX.utils.json_to_sheet(expedidasData);
  XLSX.utils.book_append_sheet(wb, wsExp, 'Expedidas');

  // 3️⃣ Aba: Resumo
  const wsResumo = XLSX.utils.json_to_sheet([
    {Total: rel.total, Alocadas: rel.alocadas, Expedidas: rel.expedidas, 'Não Alocadas': rel.naoAlocadas, Parciais: rel.parciaisAntes}
  ]);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

  XLSX.writeFile(wb, `relatorio_${nomeLote}_${Date.now()}.xlsx`);
};

// ===============================
// EXPORTAR TODOS OS LOTES PARA EXCEL
// ===============================
window.exportarRelatorioExcel = function() {
  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const rel = gerarRelatorioDoLote(lote.nome);

    if (!rel) return;

    // Aba: Lote ativo
    const ativosData = rel.alocadasDetalhes.map(d => ({
      Área: d.area,
      Rua: d.rua,
      Posição: d.posicao,
      RZ: d.rz,
      Volume: d.volume
    }));
    const wsAtivos = XLSX.utils.json_to_sheet(ativosData);
    XLSX.utils.book_append_sheet(wb, wsAtivos, `${lote.nome} - Ativo`);

    // Aba: Expedidas
    const expedidasData = [];
    rel.expedicoes.forEach(e => {
      e.detalhes.forEach(d => {
        expedidasData.push({
          ID_Expedicao: e.id,
          Tipo: e.tipo,
          Data: e.data,
          Hora: e.hora,
          Área: d.area,
          Rua: d.rua,
          Posição: d.posicao,
          RZ: d.rz || '',
          Volume: d.volume || ''
        });
      });
    });
    const wsExp = XLSX.utils.json_to_sheet(expedidasData);
    XLSX.utils.book_append_sheet(wb, wsExp, `${lote.nome} - Expedidas`);

    // Aba: Resumo
    const wsResumo = XLSX.utils.json_to_sheet([
      {Total: rel.total, Alocadas: rel.alocadas, Expedidas: rel.expedidas, 'Não Alocadas': rel.naoAlocadas, Parciais: rel.parciaisAntes}
    ]);
    XLSX.utils.book_append_sheet(wb, wsResumo, `${lote.nome} - Resumo`);
  });

  XLSX.writeFile(wb, `relatorio_todos_lotes_${Date.now()}.xlsx`);
};

// ===============================
// INICIALIZAÇÃO AO CARREGAR
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  popularSelectLotes();
});
