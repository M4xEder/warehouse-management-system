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
// CONTAR ALOCADAS NO MAPA
// ===============================
function contarGaylordsDoLote(nomeLote) {
  let total = 0;
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) total++;
      });
    });
  });
  return total;
}

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
window.abrirAlterarQuantidade = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocados = contarGaylordsDoLote(nomeLote);

  const novoTotal = Number(
    prompt(
      `Nova quantidade total para o lote "${nomeLote}":\n` +
      `(Mínimo permitido: ${alocados}, já alocados no mapa)`,
      lote.total
    )
  );

  if (!novoTotal || novoTotal < alocados) {
    alert(`Quantidade inválida. Mínimo permitido: ${alocados}`);
    return;
  }

  lote.total = novoTotal;
  saveState();

  renderDashboard();
  renderMapa();
};

// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const alocados = contarGaylordsDoLote(nomeLote);
  if (alocados > 0) {
    alert(
      `Não é possível excluir o lote. Existem ${alocados} gaylords alocadas.`
    );
    return;
  }

  const temExpedicao = state.historicoExpedidos
    && state.historicoExpedidos.some(e => e.lote === nomeLote);

  if (temExpedicao) {
    alert('Não é possível excluir o lote. Possui histórico de expedição.');
    return;
  }

  if (!confirm(`Deseja excluir o lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
  renderMapa();
};

// ===============================
// FINALIZAR LOTE SE NECESSÁRIO
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
