// ===============================
// LOTES.JS — CONTROLE DE LOTES
// ===============================

// -------------------------------
// GERAR COR ALEATÓRIA
// -------------------------------
function gerarCor() {
  return `hsl(${Math.random() * 360},70%,60%)`;
}

// -------------------------------
// CADASTRAR LOTE
// -------------------------------
window.cadastrarLote = function () {
  const nome = document.getElementById('loteNome')?.value.trim();
  const total = Number(document.getElementById('loteTotal')?.value);

  if (!nome || total <= 0) {
    alert('Informe nome e quantidade válida');
    return;
  }

  if (state.lotes.some(l => l.nome === nome)) {
    alert('Lote já existe');
    return;
  }

  state.lotes.push({
    id: crypto.randomUUID(),
    nome,
    total,
    cor: gerarCor(),
    ativo: true
  });

  saveState();
  renderDashboard();
};

// -------------------------------
// ALTERAR QUANTIDADE DO LOTE
// -------------------------------
window.alterarQuantidadeLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const alocados = contarGaylordsDoLote(nomeLote);
  const expedidos = totalExpedidoDoLote(nomeLote);

  const novoTotal = Number(
    prompt('Nova quantidade total do lote:', lote.total)
  );

  if (!novoTotal || novoTotal <= 0) {
    alert('Quantidade inválida');
    return;
  }

  if (novoTotal < alocados + expedidos) {
    alert(
      `Quantidade menor que o necessário.\n` +
      `Alocados: ${alocados}\n` +
      `Expedidos: ${expedidos}`
    );
    return;
  }

  lote.total = novoTotal;

  saveState();
  renderDashboard();
};

// -------------------------------
// EXCLUIR LOTE (COM TODAS AS REGRAS)
// -------------------------------
window.excluirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  // ❌ Regra 1: não pode ter gaylord alocada
  const alocados = contarGaylordsDoLote(nomeLote);
  if (alocados > 0) {
    alert(
      `Não é possível excluir o lote.\n` +
      `Existem ${alocados} gaylord(s) alocadas no mapa.\n` +
      `Remova todas antes.`
    );
    return;
  }

  // ❌ Regra 2: não pode ter histórico de expedição
  const expedidos = totalExpedidoDoLote(nomeLote);
  if (expedidos > 0) {
    alert(
      `Não é possível excluir o lote.\n` +
      `Este lote possui histórico de expedição (${expedidos}).\n` +
      `Finalize o despacho antes.`
    );
    return;
  }

  // ✅ Confirmação final
  if (!confirm(`Excluir definitivamente o lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
};
