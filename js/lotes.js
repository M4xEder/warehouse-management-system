// ===============================
// LOTES.JS — CONTROLE LOCAL
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

  if (!nomeInput || !totalInput) return;

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

  const lote = {
    id: crypto.randomUUID(),
    nome,
    total,
    ativo: true,
    cor: gerarCor()
  };

  state.lotes.push(lote);
  saveState();

  nomeInput.value = '';
  totalInput.value = '';

  renderDashboard();
  renderMapa();
};

// -------------------------------
// EXCLUIR LOTE (SEGURO)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const alocadas = contarGaylordsDoLote(nomeLote);
  const expedidas = contarExpedidasDoLote(nomeLote);

  if (alocadas > 0 || expedidas > 0) {
    alert('Não é possível excluir.\nExistem gaylords alocadas ou expedidas.');
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);
  saveState();

  renderDashboard();
  renderMapa();
};
