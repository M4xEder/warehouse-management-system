// ===============================
// EXPEDICAO.JS
// ===============================
let expedicaoContext = { lote: null, selecionados: [] };

function totalExpedidoDoLote(nome) {
  return state.historicoExpedidos
    .filter(e => e.lote === nome)
    .reduce((s, e) => s + e.detalhes.length, 0);
}

window.expedirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote && l.ativo);
  if (!lote) return alert('Lote inválido');

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';
  expedicaoContext = { lote: nomeLote, selecionados: [] };

  state.areas.forEach((a, ai) => {
    a.ruas.forEach((r, ri) => {
      r.posicoes.forEach((p, pi) => {
        if (p.ocupada && p.lote === nomeLote) {
          const id = `${ai}-${ri}-${pi}`;
          lista.innerHTML += `
            <label>
              <input type="checkbox" value="${id}"
              onchange="toggleSelecionado(this)">
              ${a.nome} | ${r.nome} | RZ:${p.rz} | Vol:${p.volume}
            </label><br>
          `;
        }
      });
    });
  });

  document.getElementById('modalExpedicao').classList.remove('hidden');
};

window.toggleSelecionado = function (cb) {
  cb.checked
    ? expedicaoContext.selecionados.push(cb.value)
    : expedicaoContext.selecionados =
        expedicaoContext.selecionados.filter(x => x !== cb.value);
};

window.confirmarExpedicao = function () {
  const { lote, selecionados } = expedicaoContext;
  if (!selecionados.length) return alert('Selecione ao menos uma');

  const detalhes = [];

  selecionados.forEach(id => {
    const [a, r, p] = id.split('-').map(Number);
    const pos = state.areas[a].ruas[r].posicoes[p];

    detalhes.push({
      rz: pos.rz,
      volume: pos.volume,
      data: new Date().toLocaleString()
    });

    pos.ocupada = false;
    pos.lote = pos.rz = pos.volume = null;
  });

  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote,
    detalhes,
    data: new Date().toLocaleString()
  });

  const total = state.lotes.find(l => l.nome === lote).total;
  const expedidos = totalExpedidoDoLote(lote);
  if (expedidos >= total) {
    state.lotes.find(l => l.nome === lote).ativo = false;
  }

  saveState();
  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
};

window.fecharModalExpedicao = function () {
  document.getElementById('modalExpedicao').classList.add('hidden');
};
