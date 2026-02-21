// ===============================
// MODEL.JS — MODELO GLOBAL
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
// CARREGAR ESTADO
// -------------------------------
window.loadState = function () {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;

  try {
    const parsed = JSON.parse(data);

    state.areas = parsed.areas || [];
    state.lotes = parsed.lotes || [];
    state.historicoExpedidos = parsed.historicoExpedidos || [];

    normalizarEstrutura();

  } catch (err) {
    console.error('Erro ao carregar estado:', err);
  }
};

// -------------------------------
// SALVAR ESTADO
// -------------------------------
window.saveState = function () {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// -------------------------------
// NORMALIZAR E BLINDAR
// -------------------------------
function normalizarEstrutura() {

  state.areas.forEach(area => {

    if (!area.ruas) area.ruas = [];

    area.ruas.forEach(rua => {

      if (!rua.posicoes) rua.posicoes = [];

      rua.posicoes.forEach(pos => {

        pos.ocupada = pos.ocupada || false;
        pos.lote = pos.lote || null;
        pos.rz = pos.rz || null;
        pos.volume = pos.volume || null;
        pos.cor = pos.cor || null;
        pos.data = pos.data || null;
        pos.hora = pos.hora || null;
      });
    });
  });
}

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

        // Ignora a própria posição se estiver editando
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
