// =======================================
// EXPEDICAO.JS
// Expedição TOTAL ou PARCIAL com badge
// =======================================

let expedicaoContext = null;

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  const modal = document.getElementById('modalExpedicao');
  const lista = document.getElementById('listaExpedicao');

  if (!modal || !lista) {
    alert('Modal de expedição não encontrado');
    return;
  }

  const posicoes = [];

  state.areas.forEach((area, aIdx) => {
    area.ruas.forEach((rua, rIdx) => {
      rua.posicoes.forEach((pos, pIdx) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          posicoes.push({
            areaIndex: aIdx,
            ruaIndex: rIdx,
            posicaoIndex: pIdx,
            area: area.nome,
            rua: rua.nome,
            posicao: pIdx + 1,
            rz: pos.rz,
            volume: pos.volume || '-'
          });
        }
      });
    });
  });

  if (posicoes.length === 0) {
    alert('Nenhum gaylord encontrado para este lote');
    return;
  }

  expedicaoContext = {
    nomeLote,
    posicoes
  };

  lista.innerHTML = '';

  posicoes.forEach((p, i) => {
    const item = document.createElement('div');
    item.style.borderBottom = '1px solid #ddd';
    item.style.padding = '6px 0';

    item.innerHTML = `
      <label>
        <input
          type="checkbox"
          class="expedicao-checkbox"
          data-index="${i}"
          checked
        >
        Área: ${p.area} | Rua: ${p.rua} | Pos: ${p.posicao}
        <br>
        RZ: ${p.rz} | Volume: ${p.volume}
      </label>
    `;

    lista.appendChild(item);
  });

  modal.classList.remove('hidden');
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  if (!expedicaoContext) return;

  const checks = document.querySelectorAll('.expedicao-checkbox:checked');

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const totalAlocados = expedicaoContext.posicoes.length;
  const totalSelecionados = checks.length;

  const tipo =
    totalSelecionados === totalAlocados ? 'TOTAL' : 'PARCIAL';

  const detalhes = [];

  checks.forEach(cb => {
    const idx = Number(cb.dataset.index);
    const p = expedicaoContext.posicoes[idx];

    const posicao =
      state.areas[p.areaIndex]
        .ruas[p.ruaIndex]
        .posicoes[p.posicaoIndex];

    detalhes.push({
      area: p.area,
      rua: p.rua,
      posicao: p.posicao,
      rz: p.rz,
      volume: p.volume
    });

    posicao.ocupada = false;
    posicao.lote = null;
    posicao.rz = null;
    posicao.volume = null;
  });

  // Remove lote apenas se TOTAL
  if (tipo === 'TOTAL') {
    state.lotes = state.lotes.filter(
      l => l.nome !== expedicaoContext.nomeLote
    );
  }

  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: expedicaoContext.nomeLote,
    tipo,
    quantidadeExpedida: totalSelecionados,
    quantidadeTotal: totalAlocados,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  saveState();
  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert(
    `Expedição ${tipo} realizada (${totalSelecionados}/${totalAlocados})`
  );
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {
  document
    .getElementById('modalExpedicao')
    .classList.add('hidden');

  expedicaoContext = null;
};

// -------------------------------
// SELECIONAR TODOS
// -------------------------------
window.selecionarTodosGaylords = function () {
  document
    .querySelectorAll('.expedicao-checkbox')
    .forEach(cb => (cb.checked = true));
};

window.desmarcarTodosGaylords = function () {
  document
    .querySelectorAll('.expedicao-checkbox')
    .forEach(cb => (cb.checked = false));
};
