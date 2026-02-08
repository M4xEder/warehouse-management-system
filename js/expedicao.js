// =======================================
// EXPEDICAO.JS — MODAL + REGRAS REAIS
// =======================================

let expedicaoContext = {
  lote: null,
  selecionados: []
};

// -------------------------------
// GARANTIA DE HISTÓRICO
// -------------------------------
function garantirHistorico() {
  if (!Array.isArray(state.historicoExpedidos)) {
    state.historicoExpedidos = [];
    saveState();
  }
}

// -------------------------------
// TOTAL JÁ EXPEDIDO
// -------------------------------
function totalExpedidoDoLote(nomeLote) {
  garantirHistorico();

  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((soma, e) => soma + e.quantidadeExpedida, 0);
}

// -------------------------------
// CONTAR ALOCADAS NO MAPA
// -------------------------------
function totalAlocadasNoMapa(nomeLote) {
  let total = 0;
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) total++;
      });
    });
  });
  return total;
}

// -------------------------------
// ABRIR MODAL
// -------------------------------
window.expedirLote = function (nomeLote) {
  garantirHistorico();

  const lote = state.lotes.find(l => l.nome === nomeLote && l.ativo !== false);
  if (!lote) {
    alert('Lote não encontrado ou já finalizado');
    return;
  }

  const alocadas = totalAlocadasNoMapa(nomeLote);
  if (alocadas === 0) {
    alert('Nenhuma gaylord alocada neste lote');
    return;
  }

  expedicaoContext.lote = nomeLote;
  expedicaoContext.selecionados = [];

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  state.areas.forEach((area, a) => {
    area.ruas.forEach((rua, r) => {
      rua.posicoes.forEach((pos, p) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          const id = `${a}-${r}-${p}`;
          const div = document.createElement('div');
          div.className = 'item-expedicao';

          div.innerHTML = `
            <label>
              <input type="checkbox" value="${id}" onchange="toggleSelecionado(this)">
              Área: ${area.nome} |
              Rua: ${rua.nome} |
              Pos: ${p + 1} |
              RZ: ${pos.rz} |
              Vol: ${pos.volume || '-'}
            </label>
          `;
          lista.appendChild(div);
        }
      });
    });
  });

  document.getElementById('modalExpedicao').classList.remove('hidden');
};

// -------------------------------
// SELEÇÃO
// -------------------------------
window.toggleSelecionado = function (checkbox) {
  const id = checkbox.value;
  if (checkbox.checked) expedicaoContext.selecionados.push(id);
  else expedicaoContext.selecionados = expedicaoContext.selecionados.filter(x => x !== id);
};

window.selecionarTodosGaylords = function () {
  expedicaoContext.selecionados = [];
  document.querySelectorAll('#listaExpedicao input[type="checkbox"]').forEach(cb => {
    cb.checked = true;
    expedicaoContext.selecionados.push(cb.value);
  });
};

window.desmarcarTodosGaylords = function () {
  expedicaoContext.selecionados = [];
  document.querySelectorAll('#listaExpedicao input[type="checkbox"]').forEach(cb => cb.checked = false);
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
  const totalExpedido = totalExpedidoDoLote(lote);
  const saldo = loteObj.total - totalExpedido;

  if (selecionados.length > saldo) {
    alert(`Quantidade selecionada maior que o saldo do lote\nSaldo disponível: ${saldo}`);
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
      rz: pos.rz,
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

  // Atualiza quantidade expedida no lote
  lote.expedidos = (lote.expedidos || 0) + detalhes.length;

  // Se total expedido >= total do lote, marca como finalizado
  if (lote.expedidos >= lote.total) {
    lote.ativo = false;
  }

  saveState();
  fecharModalExpedicao();
  renderMapa();
  renderDashboard();

  alert('Expedição realizada com sucesso');
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {
  document.getElementById('modalExpedicao').classList.add('hidden');
  expedicaoContext = { lote: null, selecionados: [] };
};
