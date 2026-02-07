// =======================================
// LOTES.JS — GESTÃO DE LOTES (SUPABASE)
// =======================================

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

  if (!supabase) {
    console.error('Supabase não inicializado');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('❌ Erro ao carregar lotes:', error.message);
      alert('Erro ao carregar lotes do banco. Usando localStorage.');
      carregarLocalLotes();
      return;
    }

    // Atualiza state.lotes
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
    console.error('Erro geral ao carregar lotes:', err);
    carregarLocalLotes();
  }
};

// ----------------------------------
// FALLBACK LOCAL (quando banco falha)
// ----------------------------------
function carregarLocalLotes() {
  const data = JSON.parse(localStorage.getItem('gaylords-system-state') || '{}');
  state.lotes = (data.lotes || []).map(lote => ({
    id: lote.id || crypto.randomUUID(),
    nome: lote.nome,
    total: Number(lote.total) || 0,
    saldo: Number(lote.saldo ?? lote.total) || 0,
    ativo: lote.ativo ?? true,
    cor: lote.cor || gerarCor()
  }));

  console.log('✅ Lotes carregados do localStorage:', state.lotes);
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
}

// ----------------------------------
// CRIAR LOTE (BANCO + STATE)
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

  // 🔒 Evita duplicado no front
  if (state.lotes.some(l => l.nome === nome)) {
    alert('Lote já existe');
    return;
  }

  try {
    console.log('📦 Criando lote no banco:', nome);

    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar lote:', error.message);
      alert('Erro ao salvar lote no banco');
      return;
    }

    // Atualiza state.lotes
    const novoLote = {
      id: data.id,
      nome: data.nome,
      total: data.total_gaylords,
      saldo: data.total_gaylords,
      ativo: true,
      cor: gerarCor()
    };

    state.lotes.push(novoLote);

    // Limpar inputs
    nomeInput.value = '';
    totalInput.value = '';

    // Atualiza mapa e dashboard
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();

    console.log('✅ Lote criado com sucesso:', novoLote);

  } catch (err) {
    console.error('Erro ao criar lote:', err);
    alert('Erro inesperado ao criar lote.');
  }
};

// ----------------------------------
// BOOTSTRAP — CARREGA LOTES AUTOMATICAMENTE
// ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (window.supabase) {
    carregarLotes();
  } else {
    console.warn('Supabase não encontrado, carregando lotes do localStorage');
    carregarLocalLotes();
  }
});
