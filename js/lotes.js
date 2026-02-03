// ==================================
// LOTES.JS — GESTÃO DE LOTES
// ==================================

console.log('lotes.js carregado');

// -------------------------------
// GERAR COR FIXA POR LOTE
// -------------------------------
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// -------------------------------
// CRIAR LOTE
// -------------------------------
window.cadastrarLote = function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) {
    alert('Campos de lote não encontrados');
    return;
  }

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
    cor: gerarCor()
  };

  state.lotes.push(lote);

  nomeInput.value = '';
  totalInput.value = '';

  saveState();

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  renderMapa();

  console.log('Lote criado:', lote);
};
