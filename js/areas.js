window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  const nome = input.value.trim();

  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  if (state.areas.some(a => a.nome === nome)) {
    alert('Área já existe');
    return;
  }

  state.areas.push({
    nome,
    ruas: []
  });

  input.value = '';
  saveState();
  renderMapa();
};
