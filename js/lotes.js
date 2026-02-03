// ==================================
// LOTES.JS — GESTÃO DE LOTES
// ==================================

console.log('lotes.js carregado');

// ===============================
// GERAR COR AUTOMÁTICA
// ===============================
function gerarCor() {
  // cores vivas para cada lote
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 65%)`;
}

// ===============================
// CRIAR LOTE
// ===============================
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
  if (typeof renderDashboard === 'function') renderDashboard();

  alert(`Lote "${nome}" criado com sucesso`);
};
