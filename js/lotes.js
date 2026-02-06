// ==================================
// LOTES.JS — GESTÃO DE LOTES (SUPABASE)
// ==================================

console.log('lotes.js carregado');

// ----------------------------------
// GERAR COR FIXA POR LOTE
// ----------------------------------
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// ----------------------------------
// CARREGAR LOTES DO BANCO
// ----------------------------------
window.carregarLotes = async function () {
  console.log('🔄 Carregando lotes do Supabase...');

  const { data, error } = await supabase
    .from('lotes')
    .select('*')
    .order('criado_em', { ascending: true });

  if (error) {
    console.error('❌ Erro ao carregar lotes:', error.message);
    alert('Erro ao carregar lotes do banco');
    return;
  }

  state.lotes = data.map(l => ({
    id: l.id,
    nome: l.nome,
    total: l.total_gaylords,

    // campos de controle local
    saldo: l.total_gaylords,
    ativo: true,
    cor: gerarCor()
  }));

  console.log('✅ Lotes carregados:', state.lotes);

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
};

// ----------------------------------
// CRIAR LOTE (BANCO)
// ----------------------------------
window.cadastrarLote = async function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) {
    alert('Campos de lote não encontrados');
    return;
  }

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) {
    alert('Informe nome e quantidade válida');
    return;
  }

  // 🔒 evita duplicado no front
  if (state.lotes.some(l => l.nome === nome)) {
    alert('Lote já existe');
    return;
  }

  console.log('📦 Criando lote:', nome);

  const { data, error } = await supabase
    .from('lotes')
    .insert([{
      nome,
      total_gaylords: total
    }])
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar lote:', error.message);
    alert('Erro ao salvar lote no banco');
    return;
  }

  const novoLote = {
    id: data.id,
    nome: data.nome,
    total: data.total_gaylords,
    saldo: data.total_gaylords,
    ativo: true,
    cor: gerarCor()
  };

  state.lotes.push(novoLote);

  nomeInput.value = '';
  totalInput.value = '';

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();

  console.log('✅ Lote criado com sucesso:', novoLote);
};

// ----------------------------------
// BOOTSTRAP
// ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
