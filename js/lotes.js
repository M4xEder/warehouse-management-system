
window.carregarLotesDoBanco = async function () {

  const { data, error } = await window.supabaseClient
    .from('lotes')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar lotes:', error);
    alert('Erro ao carregar lotes.');
    return;
  }

  state.lotes = data || [];
};


// ===============================
// CADASTRAR LOTE
// ===============================
window.cadastrarLote = async function () {

  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return;

  const nome = nomeInput.value.trim();
  const quantidade = Number(totalInput.value);

  if (!nome || quantidade <= 0) {
    alert('Informe nome e quantidade válida.');
    return;
  }

  // Verifica duplicidade no banco
  const { data: existente } = await window.supabaseClient
    .from('lotes')
    .select('id')
    .eq('nome', nome)
    .single();

  if (existente) {
    alert('Já existe um lote com esse nome.');
    return;
  }

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

  const { error } = await window.supabaseClient
    .from('lotes')
    .insert([
      {
        nome,
        quantidade,
        cor,
        status: 'ativo'
      }
    ]);

  if (error) {
    console.error(error);
    alert('Erro ao cadastrar lote.');
    return;
  }

  nomeInput.value = '';
  totalInput.value = '';

  await carregarLotesDoBanco();
  renderDashboard();
};


// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidadeLote = async function (nomeLote) {

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
    prompt('Nova quantidade total do lote:', lote.quantidade)
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

  const { error } = await window.supabaseClient
    .from('lotes')
    .update({ quantidade: novoTotal })
    .eq('id', lote.id);

  if (error) {
    console.error(error);
    alert('Erro ao atualizar lote.');
    return;
  }

  await carregarLotesDoBanco();
  renderDashboard();

  alert('Quantidade atualizada com sucesso.');
};


// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = async function (nomeLote) {

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

  const { error } = await window.supabaseClient
    .from('lotes')
    .delete()
    .eq('id', lote.id);

  if (error) {
    console.error(error);
    alert('Erro ao excluir lote.');
    return;
  }

  await carregarLotesDoBanco();
  renderDashboard();

  alert('Lote excluído com sucesso.');
};



// ===============================
// TOTAL EXPEDIDO (mantido por enquanto)
// ===============================
window.totalExpedidoDoLote = function (nomeLote) {

  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos.filter(
    r => r.nome === nomeLote
  ).length;
};
