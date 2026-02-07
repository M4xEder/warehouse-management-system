// ===============================
// LOTES.JS — LOCAL STORAGE
// ===============================

function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
}

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

  const lote = {
    id: crypto.randomUUID(),
    nome,
    total,
    saldo: total,
    ativo: true,
    cor: gerarCor()
  };

  state.lotes.push(lote);
  saveState();

  nomeInput.value = '';
  totalInput.value = '';

  if (typeof renderMapa === 'function') renderMapa();
  if (typeof renderDashboard === 'function') renderDashboard();
};
