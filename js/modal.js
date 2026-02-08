// =======================================
// EXPEDICAO.JS — MODAL + REGRAS REAIS
// =======================================

let expedicaoContext = {
  lote: null,
  selecionados: []
};

// -------------------------------
// GARANTIR HISTÓRICO
// -------------------------------
function garantirHistorico() {
  if (!Array.isArray(state.historicoExpedidos)) {
    state.historicoExpedidos = [];
  }
}

// -------------------------------
// TOTAL JÁ EXPEDIDO DO LOTE
// -------------------------------
function totalExpedidoDoLote(nomeLote) {
  garantirHistorico();

  return state.historicoExpedidos
    .filter(h => h.lote === nomeLote)
    .reduce((soma, h) => soma + h.quantidadeExpedida, 0);
}

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  garantirHistorico();

  const lote = state.lotes.find(l => l.nome === nomeLote && l.ativo !== false);
  if (!lote) {
    alert('Lote não encontrado ou inativo');
    return;
  }

  const totalExpedido = totalExpedidoDoLote(nomeLote);
  const saldo = lote.total - totalExpedido;

  if (saldo <= 0) {
    alert('Este lote já foi totalmente expedido');
    return;
  }

  expedicaoContext = {
    lote: nomeLote,
    selecionados: []
  };

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  let encontrados = 0;

  state.areas.forEach((area, a) => {
    area.ruas.forEach((rua, r) => {
      rua.posicoes.forEach((pos, p) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          encontrados++;

          const id = `${a}-${r}-${p}`;

          const div = document.createElement('div');
          div.className = 'item-expedicao';

          div.innerHTML = `
            <label>
              <input type="checkbox"
                     value="${id}"
                     onchange="toggleSelecionado(this)">
              Área: ${area.nome} |
              Rua: ${rua.nome} |
              Pos: ${p + 1} |
              RZ: ${pos.rz || '-'} |
              Vol: ${pos.volume || '-'}
            </label>
          `;

          lista.appendChild(div);
        }
      });
    });
  });

  if (encontrados === 0) {
    alert('Não há gaylords alocadas para este lote');
    return;
  }

  document
    .getElementById('modalExpedicao')
    .classList.remove('hidden');
};

// -------------------------------
// CONTROLE DE SELEÇÃO
// -------------------------------
window.toggleSelecionado = function (checkbox) {
  const id = checkbox.value;

  if (checkbox.checked) {
    if (!expedicaoContext.selecionados.includes(id)) {
      expedicaoContext.selecionados.push(id);
    }
  } else {
    expedicaoContext.selecionados =
      expedicaoContext.selecionados.filter(x => x !== id);
  }
};

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
    .forEach(cb => cb.checked = false);
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  garantirHistorico();

  const { lote, selecionados } = expedicaoContext;

  if (!lote || selecionados.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const loteObj = state.lotes.find(l => l.nome === lote);
  if (!loteObj) {
    alert('Lote inválido');
    return;
  }

  const saldo = loteObj.total - totalExpedidoDoLote(lote);

  if (selecionados.length > saldo) {
    alert(`Quantidade selecionada excede o saldo do lote (${saldo})`);
    return;
  }

  const detalhes = [];

  selecionados.forEach(id => {
    const [a, r, p] = id.split('-').map(Number);
    const pos = state.areas[a].ruas[r].posicoes[p];

    detalhes.push({
      area: state.areas[a].nome,
      rua: state.areas[a].ruas[r].nome,
      posicao: p + 1,
      rz: pos.rz || '-',
      volume: pos.volume || '-'
    });

    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;
  });

  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote,
    quantidadeExpedida: detalhes.length,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  saveState();

  fecharModalExpedicao();
  renderMapa();
  renderDashboard();

  if (typeof renderLotesExpedidos === 'function') {
    renderLotesExpedidos();
  }

  alert('Expedição realizada com sucesso');
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {
  document
    .getElementById('modalExpedicao')
    .classList.add('hidden');

  expedicaoContext = {
    lote: null,
    selecionados: []
  };
};
