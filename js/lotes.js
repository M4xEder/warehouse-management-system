// ===============================
// LOTES.JS
// ===============================
function gerarCor() {
  return `hsl(${Math.random() * 360},70%,60%)`;
}

window.cadastrarLote = function () {
  const nome = document.getElementById('loteNome').value.trim();
  const total = Number(document.getElementById('loteTotal').value);

  if (!nome || total <= 0) {
    alert('Dados inválidos');
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
    ativo: true
  });

  saveState();
  renderDashboard();
};

window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocados = contarGaylordsDoLote(nomeLote);
  const expedidos = totalExpedidoDoLote(nomeLote);

  const novo = Number(prompt('Nova quantidade total:', lote.total));
  if (!novo || novo < alocados + expedidos) {
    alert('Quantidade menor que alocados + expedidos');
    return;
  }

  lote.total = novo;
  saveState();
  renderDashboard();
};

window.excluirLote = function (nomeLote) {
  if (!confirm('Excluir lote?')) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);
  saveState();
  renderDashboard();
};
