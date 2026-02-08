// ===============================
// LOTES.JS — CONTROLE DE LOTES
// ===============================

function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
}

// -------------------------------
// CRIAR LOTE
// -------------------------------
window.cadastrarLote = function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) {
    alert('Informe nome e quantidade válida');
    return;
  }

  if (state.lotes.some(l => l.nome === nome)) {
    alert('Lote já existe');
    return;
  }

  const lote = {
    id: crypto.randomUUID(),
    nome,
    total,
    ativo: true,
    cor: gerarCor()
  };

  state.lotes.push(lote);
  saveState();

  nomeInput.value = '';
  totalInput.value = '';

  renderDashboard();
  renderMapa();
};

// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
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
};

// -------------------------------
// TOTAL EXPEDIDO PELO HISTÓRICO
// -------------------------------
function totalExpedidoDoLote(nomeLote) {
  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos
    .filter(h => h.lote === nomeLote)
    .reduce((soma, h) => soma + h.quantidadeExpedida, 0);
}

// -------------------------------
// CALCULAR SALDO REAL
// saldo = total - expedidos (histórico) - alocados
// -------------------------------
window.calcularSaldoLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return 0;

  const alocados = contarGaylordsDoLote(nomeLote);
  const expedidos = totalExpedidoDoLote(nomeLote);

  return lote.total - alocados - expedidos;
};

// -------------------------------
// ALTERAR QUANTIDADE DO LOTE
// -------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const novoTotal = Number(
    prompt(`Nova quantidade total para o lote "${nomeLote}":`, lote.total)
  );

  if (!novoTotal || novoTotal <= 0) {
    alert('Quantidade inválida');
    return;
  }

  const alocados = contarGaylordsDoLote(nomeLote);
  const expedidos = totalExpedidoDoLote(nomeLote);
  const minimoPermitido = alocados + expedidos;

  if (novoTotal < minimoPermitido) {
    alert(
      `Quantidade inválida.\n\n` +
      `Mínimo permitido: ${minimoPermitido}\n` +
      `(Alocados: ${alocados} | Expedidos: ${expedidos})`
    );
    return;
  }

  lote.total = novoTotal;
  lote.ativo = true; // reativa se estava finalizado

  saveState();
  renderDashboard();
  renderMapa();
};

// -------------------------------
// EXCLUIR LOTE ATIVO
// -------------------------------
window.excluirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const alocados = contarGaylordsDoLote(nomeLote);
  if (alocados > 0) {
    alert(
      `Não é possível excluir o lote.\n` +
      `Existem ${alocados} gaylords alocadas no mapa.`
    );
    return;
  }

  const temHistorico =
    Array.isArray(state.historicoExpedidos) &&
    state.historicoExpedidos.some(h => h.lote === nomeLote);

  if (temHistorico) {
    alert(
      'Não é possível excluir o lote.\n' +
      'Este lote possui histórico de expedição.'
    );
    return;
  }

  if (!confirm(`Excluir definitivamente o lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};

// -------------------------------
// FINALIZAR LOTE AUTOMATICAMENTE
// -------------------------------
window.finalizarLoteSeNecessario = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const saldo = calcularSaldoLote(nomeLote);

  if (saldo <= 0) {
    lote.ativo = false;
    saveState();
  }
};
