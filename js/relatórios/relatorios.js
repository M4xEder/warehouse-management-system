// =======================================
// RELATORIOS.JS
// Consolidação de dados para relatórios
// NÃO altera estado, apenas lê o state
// =======================================

console.log('relatorios.js carregado');

// -------------------------------
// CONTAR ALOCADOS NO MAPA
// -------------------------------
function contarAlocados(loteNome) {
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
}

// -------------------------------
// LISTAR ALOCADOS (DETALHADO)
// -------------------------------
function listarAlocados(loteNome, filtroRz = '') {
  const lista = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (
          pos.ocupada &&
          pos.lote === loteNome &&
          (!filtroRz || pos.rz === filtroRz)
        ) {
          lista.push({
            area: area.nome,
            rua: rua.nome,
            posicao: index + 1,
            rz: pos.rz || '',
            volume: pos.volume || ''
          });
        }
      });
    });
  });

  return lista;
}

// -------------------------------
// LISTAR EXPEDIDOS (DETALHADO)
// -------------------------------
function listarExpedidos(loteNome, filtroRz = '') {
  const lista = [];

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote !== loteNome) return;

    exp.detalhes.forEach(d => {
      if (!filtroRz || d.rz === filtroRz) {
        lista.push({
          data: exp.data,
          hora: exp.hora,
          rz: d.rz || '',
          volume: d.volume || ''
        });
      }
    });
  });

  return lista;
}

// -------------------------------
// TOTAL EXPEDIDO DO LOTE
// -------------------------------
function contarExpedidos(loteNome) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === loteNome) {
      total += exp.quantidadeExpedida;
    }
  });

  return total;
}

// -------------------------------
// NÚMERO DE EXPEDIÇÕES DO LOTE
// -------------------------------
function contarExpedicoes(loteNome) {
  return state.historicoExpedidos.filter(
    e => e.lote === loteNome
  ).length;
}

// -------------------------------
// CONSOLIDAR DADOS DO LOTE
// -------------------------------
window.consolidarLoteRelatorio = function (loteNome, filtroRz = '') {
  const lote = state.lotes.find(l => l.nome === loteNome);
  if (!lote) return null;

  const totalLote = lote.total;
  const alocados = contarAlocados(loteNome);
  const expedidos = contarExpedidos(loteNome);

  const naoAlocados = Math.max(
    totalLote - alocados - expedidos,
    0
  );

  const saldo = totalLote - expedidos;

  const qtdExpedicoes = contarExpedicoes(loteNome);

  let mensagem = 'Lote sem expedição';
  if (qtdExpedicoes === 1 && saldo === 0) {
    mensagem = 'Lote expedido em uma única expedição';
  } else if (qtdExpedicoes > 1 && saldo === 0) {
    mensagem =
      `Este lote teve ${qtdExpedicoes - 1} ` +
      `expedições parciais antes da final`;
  } else if (qtdExpedicoes > 0 && saldo > 0) {
    mensagem =
      `Lote com ${qtdExpedicoes} expedição(ões) parcial(is)`;
  }

  return {
    lote: loteNome,
    total: totalLote,
    alocados,
    expedidos,
    naoAlocados,
    saldo,
    mensagem,
    listaAlocados: listarAlocados(loteNome, filtroRz),
    listaExpedidos: listarExpedidos(loteNome, filtroRz)
  };
};

// -------------------------------
// POPULAR SELECT DE LOTES
// -------------------------------
window.carregarSelectRelatorios = function () {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
};

// -------------------------------
// INIT AUTOMÁTICO
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarSelectRelatorios();
});
