// ===============================
// LOTES.JS — CONTROLE DE LOTES
// ===============================

function gerarCor() {
  return `hsl(${Math.random() * 360},70%,65%)`;
}

// ===============================
// CRIAR LOTE
// ===============================
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
    expedidos: 0,
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

// ===============================
// CALCULAR SALDO
// saldo = total - expedidos - alocados
// ===============================
window.calcularSaldoLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return 0;

  const alocados = contarGaylordsDoLote(nomeLote);
  return lote.total - lote.expedidos - alocados;
};

// ===============================
// ALTERAR QUANTIDADE DO LOTE
// ===============================
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
  const minimo = alocados + lote.expedidos;

  if (novoTotal < minimo) {
    alert(
      `Quantidade inválida.\n` +
      `Mínimo permitido: ${minimo}\n` +
      `(Alocados: ${alocados} | Expedidos: ${lote.expedidos})`
    );
    return;
  }

  lote.total = novoTotal;

  saveState();
  renderDashboard();
  renderMapa();
};

// ===============================
// EXCLUIR LOTE ATIVO
// ===============================
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

  const temExpedicao = state.historicoExpedidos
    && state.historicoExpedidos.some(e => e.lote === nomeLote);

  if (temExpedicao) {
    alert(
      'Não é possível excluir o lote.\n' +
      'Este lote possui histórico de expedição.'
    );
    return;
  }

  if (!confirm(`Excluir definitivamente o lote "${nomeLote}"?`)) {
    return;
  }

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};

// ===============================
// FINALIZAR LOTE (quando saldo = 0)
// ===============================
window.finalizarLoteSeNecessario = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const saldo = calcularSaldoLote(nomeLote);

  if (saldo <= 0) {
    lote.ativo = false;
    saveState();
  }
};
