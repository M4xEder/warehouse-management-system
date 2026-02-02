window.cadastrarArea = function () {
  const nome = document.getElementById('areaNome').value.trim();
  if (!nome) return alert('Informe o nome da área');

  state.areas.push({
    nome,
    ruas: [
      { posicoes: Array.from({ length: 10 }, () => ({ ocupada: false })) }
    ]
  });

  saveState();
  renderMapa();
};
