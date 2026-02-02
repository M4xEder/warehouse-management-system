window.gerarCor = function () {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

window.dataAtual = function () {
  return new Date().toLocaleString('pt-BR');
};
