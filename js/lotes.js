// ===============================
// LOTES.JS — CONTROLE DE LOTES
// ===============================

function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
}

// -------------------------------
// CADASTRAR LOTE
// -------------------------------
window.cadastrarLote = function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

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
    ativo: true,
    cor: gerarCor()
  });

  saveState();

  nomeInput.value = '';
  totalInput.value = '';

  renderMapa();
  renderDashboard();
};

// -------------------------------
// EXCLUIR LOTE
// -------------------------------
window.excluirLote = function (nomeLote) {
  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = contarExpedidasDoLote(nomeLote);

  if (alocadas > 0 || expedidas > 0) {
    alert('Não é possível excluir lote com movimentação.');
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);
  saveState();

  renderMapa();
  renderDashboard();
};
