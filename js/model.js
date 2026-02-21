// ===============================
// MODEL.JS — ESTADO + REGRAS
// ===============================

const STORAGE_KEY = 'gaylords-system-state';

// -------------------------------
// ESTADO GLOBAL
// -------------------------------
window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};

// -------------------------------
// PERSISTÊNCIA
// -------------------------------
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

window.loadState = function () {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  const parsed = JSON.parse(data);
  state.areas = parsed.areas || [];
  state.lotes = parsed.lotes || [];
  state.historicoExpedidos = parsed.historicoExpedidos || [];
};

// -------------------------------
// CONTADORES
// -------------------------------
window.contarGaylordsDoLote = function (loteNome) {

  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === loteNome) {
          total++;
        }
      });
    });
  });

  return total;
};

window.totalExpedidoDoLote = function (loteNome) {

  return state.historicoExpedidos
    .filter(item => item.lote === loteNome)
    .reduce((acc, item) => acc + (item.quantidade || 1), 0);
};

// -------------------------------
// VALIDAÇÃO RZ DUPLICADO
// -------------------------------
window.rzJaExiste = function (rz, ignorarContexto = null) {

  let existe = false;

  state.areas.forEach((area, aIndex) => {
    area.ruas.forEach((rua, rIndex) => {
      rua.posicoes.forEach((pos, pIndex) => {

        if (!pos.ocupada) return;

        // Ignora a própria posição (caso edição futura)
        if (
          ignorarContexto &&
          ignorarContexto.areaIndex === aIndex &&
          ignorarContexto.ruaIndex === rIndex &&
          ignorarContexto.posicaoIndex === pIndex
        ) {
          return;
        }

        if (pos.rz === rz) {
          existe = true;
        }

      });
    });
  });

  return existe;
};
