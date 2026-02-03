// ==================================
// LOTES.JS — GESTÃO DE LOTES
// ==================================

// ===============================
// CRIAR LOTE
// ===============================
window.cadastrarLote = function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return;

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
    cor: gerarCor()
  };

  state.lotes.push(lote);

  nomeInput.value = '';
  totalInput.value = '';

  saveState();
  renderDashboard();
};

// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidadeLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return;

  const usados = contarUsadosDoLote(lote.nome);

  const novoTotal = Number(
    prompt(
      `Nova quantidade para "${lote.nome}" (usados: ${usados})`,
      lote.total
    )
  );

  if (isNaN(novoTotal) || novoTotal < usados) {
    alert(`Quantidade inválida. Mínimo permitido: ${usados}`);
    return;
  }

  lote.total = novoTotal;
  saveState();
  renderDashboard();
};

// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return;

  const usados = contarUsadosDoLote(lote.nome);

  if (usados > 0) {
    alert('Não é possível excluir. Existem gaylords alocadas.');
    return;
  }

  if (!confirm(`Excluir lote "${lote.nome}"?`)) return;

  state.lotes = state.lotes.filter(l => l.id !== loteId);
  saveState();
  renderDashboard();
};

// ===============================
// CONTADOR (FONTE ÚNICA)
// ===============================
function contarUsadosDoLote(nomeLote) {
  let total = 0;

  state.areas.forEach(area =>
    area.ruas.forEach(rua =>
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          total++;
        }
      })
    )
  );

  return total;
}

// ===============================
// GERAR COR
// ===============================
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}
