// =======================================
// RELATORIOS.JS
// Leitura e consolidação de dados
// =======================================

console.log('relatorios.js carregado');

// ===============================
// UTIL — CONTAR ALOCAÇÕES NO MAPA
// ===============================
function contarAlocadosNoMapa(nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          total++;
        }
      });
    });
  });

  return total;
}

// ===============================
// UTIL — DADOS DE EXPEDIÇÃO
// ===============================
function obterDadosExpedicao(nomeLote) {
  const registros =
    state.historicoExpedidos.filter(e => e.lote === nomeLote);

  let totalExpedido = 0;
  let parciais = 0;
  let teveFinal = false;

  registros.forEach(r => {
    totalExpedido += r.quantidadeExpedida;
    if (r.tipo === 'PARCIAL') parciais++;
    if (r.tipo === 'TOTAL') teveFinal = true;
  });

  return {
    registros,
    totalExpedido,
    parciais,
    teveFinal
  };
}

// ===============================
// CONSOLIDAR DADOS DO LOTE
// ===============================
window.consolidarLoteRelatorio = function (lote) {
  const total = lote.total;

  const alocados = contarAlocadosNoMapa(lote.nome);

  const {
    registros,
    totalExpedido,
    parciais,
    teveFinal
  } = obterDadosExpedicao(lote.nome);

  const naoAlocados = Math.max(
    total - alocados - totalExpedido,
    0
  );

  const saldo = total - totalExpedido;

  let status = 'ATIVO';

  if (teveFinal || saldo === 0) {
    status = 'TOTALMENTE EXPEDIDO';
  } else if (totalExpedido > 0) {
    status = 'PARCIAL';
  }

  let mensagem = '';

  if (parciais > 0 && teveFinal) {
    mensagem =
      `Este lote teve ${parciais} ` +
      `expedições parciais antes da final`;
  }

  return {
    nome: lote.nome,
    total,
    alocados,
    expedidos: totalExpedido,
    naoAlocados,
    saldo,
    status,
    mensagem,
    registros
  };
};

// ===============================
// POPULAR SELECT DE LOTES
// ===============================
window.popularSelectRelatorios = function () {
  const select =
    document.getElementById('selectLoteRelatorio');

  if (!select) return;

  select.innerHTML =
    '<option value="">Selecione um lote</option>';

  state.lotes.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote.nome;
    opt.textContent = lote.nome;
    select.appendChild(opt);
  });
};

// ===============================
// EXPORTAÇÃO — DADOS CONSOLIDADOS
// ===============================
window.obterRelatorioTodosLotes = function () {
  return state.lotes.map(lote =>
    consolidarLoteRelatorio(lote)
  );
};

window.obterRelatorioLote = function (nomeLote) {
  const lote =
    state.lotes.find(l => l.nome === nomeLote);

  if (!lote) return null;

  return consolidarLoteRelatorio(lote);
};

// ===============================
// INIT AUTOMÁTICO
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  popularSelectRelatorios();
});
