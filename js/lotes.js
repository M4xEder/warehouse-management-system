// ==================================
// LOTES.JS — GESTÃO DE LOTES
// ==================================

function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

window.cadastrarLote = function () {
  const nome = loteNome.value.trim();
  const total = Number(loteTotal.value);

  if (!nome || total <= 0) {
    alert('Informe nome e quantidade válida');
    return;
  }

  if (state.lotes.some(l => l.nome === nome)) {
    alert('Lote já existe');
    return;
  }

  state.lotes.push({
    id: crypto.randomUUID(),
    nome,
    total,
    cor: gerarCor(),
    finalizado: false
  });

  loteNome.value = '';
  loteTotal.value = '';

  saveState();
  renderDashboard();
  renderMapa();
};

window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const novoTotal = Number(
    prompt(`Nova quantidade total para o lote "${nomeLote}"`, lote.total)
  );

  if (!novoTotal || novoTotal <= 0) return;

  lote.total = novoTotal;

  saveState();
  renderDashboard();
};
