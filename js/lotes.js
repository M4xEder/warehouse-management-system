/* // ===============================
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

*/

// ===============================
// LOTES.JS — GERENCIAMENTO DE LOTES
// ===============================



// ===============================
// CADASTRAR LOTE
// ===============================
window.cadastrarLote = function () {

  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return;

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) {
    alert('Informe nome e quantidade válida.');
    return;
  }

  if (state.lotes.some(l => l.nome === nome)) {
    alert('Já existe um lote com esse nome.');
    return;
  }

  // 🔥 GERAR COR AUTOMÁTICA
  const cores = [
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316'
  ];

  const cor = cores[Math.floor(Math.random() * cores.length)];

  state.lotes.push({
    id: Date.now(),   // ID único
    nome,
    total,
    cor               // COR
  });

  saveState();

  nomeInput.value = '';
  totalInput.value = '';

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
};


// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidadeLote = function (nomeLote) {

  const lote = state.lotes.find(l => l.nome === nomeLote);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  const alocados = typeof contarGaylordsDoLote === 'function'
    ? contarGaylordsDoLote(nomeLote)
    : 0;

  const expedidos = typeof totalExpedidoDoLote === 'function'
    ? totalExpedidoDoLote(nomeLote)
    : 0;

  const novoTotal = Number(
    prompt('Nova quantidade total do lote:', lote.total)
  );

  if (!novoTotal || novoTotal <= 0) {
    alert('Quantidade inválida.');
    return;
  }

  if (novoTotal < (alocados + expedidos)) {
    alert(
      `Quantidade menor que necessário.\n\n` +
      `Alocados: ${alocados}\n` +
      `Expedidos: ${expedidos}`
    );
    return;
  }

  lote.total = novoTotal;

  saveState();

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  alert('Quantidade atualizada com sucesso.');
};



// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = function (nomeLote) {

  const lote = state.lotes.find(l => l.nome === nomeLote);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  const alocados = typeof contarGaylordsDoLote === 'function'
    ? contarGaylordsDoLote(nomeLote)
    : 0;

  const expedidos = typeof totalExpedidoDoLote === 'function'
    ? totalExpedidoDoLote(nomeLote)
    : 0;

  if (alocados > 0) {
    alert(`Existem ${alocados} gaylord(s) alocadas neste lote.`);
    return;
  }

  if (expedidos > 0) {
    alert('Este lote possui histórico de expedição.');
    return;
  }

  if (!confirm(`Deseja realmente excluir o lote "${nomeLote}"?`)) {
    return;
  }

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

  alert('Lote excluído com sucesso.');
};



// ===============================
// FUNÇÃO AUXILIAR - TOTAL EXPEDIDO
// (Compatível com novo formato)
// ===============================
window.totalExpedidoDoLote = function (nomeLote) {

  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos.filter(
    r => r.nome === nomeLote
  ).length;
};

window.statusDoLote = function (nomeLote) {

  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return '—';

  const total = lote.total;
  const expedidos = totalExpedidoDoLote(nomeLote);

  if (expedidos === 0) {
    return 'Ativo';
  }

  if (expedidos > 0 && expedidos < total) {
    return 'Parcial';
  }

  if (expedidos >= total) {
    return 'Expedidо Total';
  }

  return 'Ativo';
};
