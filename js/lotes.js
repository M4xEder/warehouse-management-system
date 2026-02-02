// ==================================
// LOTES.JS — GESTÃO DE LOTES
// ==================================

// ===============================
// CRIAR LOTE
// ===============================
window.cadastrarLote = function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return;

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) {
    return alert('Informe nome e quantidade válida');
  }

  if (state.lotes.some(l => l.nome === nome)) {
    return alert('Lote já existe');
  }

  const lote = {
    id: crypto.randomUUID(),
    nome,
    total,
    usados: 0,
    cor: gerarCor()
  };

  state.lotes.push(lote);

  nomeInput.value = '';
  totalInput.value = '';

  saveState();
  renderDashboard();
};

// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidadeLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return;

  const novoTotal = Number(
    prompt(
      `Nova quantidade para "${lote.nome}" (usados: ${lote.usados})`,
      lote.total
    )
  );

  if (isNaN(novoTotal) || novoTotal < lote.usados) {
    return alert(`Quantidade inválida. Mínimo: ${lote.usados}`);
  }

  lote.total = novoTotal;
  saveState();
  renderDashboard();
};

// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return;

  if (lote.usados > 0) {
    return alert('Não é possível excluir. Existem gaylords alocadas.');
  }

  if (!confirm(`Excluir lote "${lote.nome}"?`)) return;

  state.lotes = state.lotes.filter(l => l.id !== loteId);
  saveState();
  renderDashboard();
};

// ===============================
// GERAR COR
// ===============================
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}
