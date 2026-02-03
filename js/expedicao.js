// =======================================
// EXPEDICAO.JS
// Expedição total ou parcial de lotes
// =======================================

window.expedirLote = function (nomeLote) {
  if (!nomeLote) return;

  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const detalhes = [];
  let expedidos = 0;

  // Total alocado ANTES da expedição
  const totalAlocadoAntes = contarGaylordsDoLote(nomeLote);

  // Percorre o mapa
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          detalhes.push({
            area: area.nome,
            rua: rua.nome,
            posicao: index + 1,
            rz: pos.rz,
            volume: pos.volume || '-'
          });

          // limpa posição
          pos.ocupada = false;
          pos.lote = null;
          pos.rz = null;
          pos.volume = null;

          expedidos++;
        }
      });
    });
  });

  if (expedidos === 0) {
    alert('Nenhum gaylord alocado para este lote');
    return;
  }

  // Define tipo da expedição
  const tipo =
    expedidos === totalAlocadoAntes ? 'TOTAL' : 'PARCIAL';

  // Histórico
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    tipo,
    quantidade: expedidos,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  // 🔑 SÓ REMOVE O LOTE SE FOR TOTAL
  if (tipo === 'TOTAL') {
    state.lotes = state.lotes.filter(l => l.nome !== nomeLote);
  }

  saveState();

  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert(
    `Expedição ${tipo} do lote "${nomeLote}" (${expedidos})`
  );
};
