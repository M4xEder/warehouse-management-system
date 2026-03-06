// ===============================
// AREAS.JS — GERENCIAMENTO DE ÁREAS
// ===============================

// -------------------------------
// CRIAR ÁREA
// -------------------------------
window.cadastrarArea = function () {

  const nome = prompt("Nome da área:");

  if (!nome) return;

  const novaArea = {
    nome: nome,
    ruas: []
  };

  state.areas.push(novaArea);

  saveState();

  renderMapa();
};


// -------------------------------
// CRIAR RUA
// -------------------------------
window.criarRua = function (areaIndex) {

  const nomeRua = prompt("Nome da rua:");

  if (!nomeRua) return;

  const novaRua = {
    nome: nomeRua,
    posicoes: []
  };

  // gerar posições padrão
  for (let i = 1; i <= 10; i++) {

    novaRua.posicoes.push({
      codigo: nomeRua + "-" + i,
      ocupado: false,
      lote: null
    });

  }

  state.areas[areaIndex].ruas.push(novaRua);

  saveState();

  renderMapa();
};


// -------------------------------
// EXCLUIR ÁREA
// -------------------------------
window.excluirArea = function (areaIndex) {

  if (!confirm("Deseja excluir esta área?")) return;

  state.areas.splice(areaIndex, 1);

  saveState();

  renderMapa();

};


// -------------------------------
// EXCLUIR RUA
// -------------------------------
window.excluirRua = function (areaIndex, ruaIndex) {

  if (!confirm("Deseja excluir esta rua?")) return;

  state.areas[areaIndex].ruas.splice(ruaIndex, 1);

  saveState();

  renderMapa();

};
