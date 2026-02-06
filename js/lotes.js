console.log('lotes.js carregado');

// ===============================
// GERAR COR ALEATÓRIA
// ===============================
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// ===============================
// CARREGAR LOTES DO BANCO
// ===============================
window.carregarLotes = async function () {
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('Erro ao carregar lotes:', error.message);
      alert('Erro ao carregar lotes do banco, usando localStorage');
      carregarLocal();
      return;
    }

    state.lotes = data.map(l => ({
      id: l.id,
      nome: l.nome,
      total: l.total_gaylords,
      saldo: l.total_gaylords,
      ativo: true,
      cor: gerarCor()
    }));

    console.log('✅ Lotes carregados do banco:', state.lotes);

    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();
  } catch (err) {
    console.error('Erro geral carregarLotes:', err);
    alert('Erro ao carregar lotes, fallback para localStorage');
    carregarLocal();
  }
};

// ===============================
// CRIAR LOTE (MODAL OU FORMULÁRIO)
// ===============================
window.cadastrarLote = async function (modal = false) {
  // pega os inputs
  const nomeInput = modal
    ? document.getElementById('modalLoteNome')
    : document.getElementById('loteNome');

  const totalInput = modal
    ? document.getElementById('modalLoteTotal')
    : document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return alert('Campos de lote não encontrados');

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) return alert('Informe nome e quantidade válida');

  // valida duplicidade
  if (state.lotes.some(l => l.nome.toLowerCase() === nome.toLowerCase())) {
    return alert('Lote já existe');
  }

  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) throw error;

    // adiciona ao state
    const novoLote = {
      id: data.id,
      nome: data.nome,
      total: data.total_gaylords,
      saldo: data.total_gaylords,
      ativo: true,
      cor: gerarCor()
    };

    state.lotes.push(novoLote);

    // limpa inputs
    nomeInput.value = '';
    totalInput.value = '';

    // atualiza mapa e dashboard
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();

    alert('Lote criado com sucesso ✅');

  } catch (err) {
    console.error('Erro ao criar lote no banco:', err);
    alert('Erro ao criar lote no banco');
  }
};

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', carregarLotes);
