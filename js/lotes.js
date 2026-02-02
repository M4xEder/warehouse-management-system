window.cadastrarLote = function () {
  const nome = document.getElementById('loteNome').value.trim();
  const total = Number(document.getElementById('loteTotal').value);

  if (!nome || total <= 0) return alert('Dados inválidos');

  state.lotes.push({
    nome,
    total,
    usados: 0,
    cor: gerarCor(),
    volumes: []
  });

  saveState();
  renderDashboard();
};
