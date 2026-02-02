// Estado global do sistema
window.state = {
  areas: [],
  lotes: [],
  historico: []
};

// Carregar do localStorage
window.loadState = function () {
  state.areas = JSON.parse(localStorage.getItem('areas')) || [];
  state.lotes = JSON.parse(localStorage.getItem('lotes')) || [];
  state.historico = JSON.parse(localStorage.getItem('historico')) || [];
};

// Salvar no localStorage
window.saveState = function () {
  localStorage.setItem('areas', JSON.stringify(state.areas));
  localStorage.setItem('lotes', JSON.stringify(state.lotes));
  localStorage.setItem('historico', JSON.stringify(state.historico));
};
