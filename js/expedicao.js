// =======================================
// EXPEDICAO.JS — EXPEDIÇÃO PARCIAL E TOTAL
// =======================================

let expedicaoContext = {
  lote: null,
  selecionados: []
};

// ===============================
// ABRIR MODAL DE EXPEDIÇÃO
// ===============================
window.expedirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  expedicaoContext.lote = nomeLote;
  expedicaoContext.selecionados = [];

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  let encontrados = 0;

  state.areas.forEach((area, areaIndex) => {
    area.ruas.forEach((rua, ruaIndex) => {
      rua.posicoes.forEach((pos, posIndex) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          encontrados++;

          const id = `${areaIndex}-${ruaIndex}-${posIndex}`;

          const div = document.createElement('div');
          div.className = 'item-expedicao';

          div.innerHTML = `
            <label>
              <input
                type="checkbox"
                value="${id}"
                onchange="toggleSelecionado(this)"
              >
              Área: ${area.nome} |
              Rua: ${rua.nome} |
              Pos: ${posIndex + 1} |
              RZ: ${pos.rz} |
              Vol: ${pos.volume || '-'}
            </label>
          `;

          lista.appendChild(div);
        }
      });
    });
  });

  if (encontrados === 0) {
    alert('Nenhuma gaylord alocada neste lote');
    return;
  }

  document
    .getElementById('modalExpedicao')
    .classList.remove('hidden');
};

// ===============================
// SELEÇÃO INDIVIDUAL
// ===============================
window.toggleSelecionado = function (checkbox) {
  const id = checkbox.value;

  if (checkbox.checked) {
    expedicaoContext.selecionados.push(id);
  } else {
    expedicaoContext.selecionados =
      expedicaoContext.selecionados.filter(x => x !== id);
  }
};

// ===============================
// SELECIONAR / DESMARCAR TODOS
// ===============================
window.selecionarTodosGaylords = function () {
  expedicaoContext.selecionados = [];

  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(cb => {
      cb.checked = true;
      expedicaoContext.selecionados.push(cb.value);
    });
};

window.desmarcarTodosGaylords = function () {
  expedicaoContext.selecionados = [];

  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(cb => (cb.checked = false));
};

// ===============================
// CONFIRMAR EXPEDIÇÃO
// ===============================
window.confirmarExpedicao = function () {
  const { lote, selecionados } = expedicaoContext;

  if (!lote || selecionados.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const detalhes = [];

  selecionados.forEach(id => {
    const [a, r, p] = id.split('-').map(Number);

    const pos =
      state.areas[a]
        .ruas[r]
        .posicoes[p];

    detalhes.push({
      area: state.areas[a].nome,
      rua: state.areas[a].ruas[r].nome,
      posicao: p + 1,
      rz: pos.rz,
      volume: pos.volume || '-'
    });

    // LIMPA POSIÇÃO (IMPORTANTE)
    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;
  });

  const totalAlocadoAntes =
    contarGaylordsDoLote(lote) + detalhes.length;

  const tipo =
    detalhes.length === totalAlocadoAntes
      ? 'TOTAL'
      : 'PARCIAL';

  // ===============================
  // REGISTRA HISTÓRICO
  // ===============================
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote,
    tipo,
    quantidadeExpedida: detalhes.length,
    quantidadeTotal: totalAlocadoAntes,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  // ===============================
  // FECHA MODAL + RENDER
  // ===============================
  saveState();
  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert(
    `Expedição ${tipo} realizada: ${detalhes.length} gaylords`
  );
};

// ===============================
// FECHAR MODAL EXPEDIÇÃO
// ===============================
window.fecharModalExpedicao = function () {
  document
    .getElementById('modalExpedicao')
    .classList.add('hidden');

  expedicaoContext = {
    lote: null,
    selecionados: []
  };
};
