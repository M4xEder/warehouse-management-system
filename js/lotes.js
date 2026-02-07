// ===============================
// LOTES.JS — COM SALDO REAL
// ===============================

function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
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
    saldo: total,   // ← começa igual ao total
    ativo: true,
    cor: gerarCor()
  });

  saveState();
  renderMapa();
  renderDashboard();

  loteNome.value = '';
  loteTotal.value = '';
};
