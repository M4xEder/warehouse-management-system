// =======================================
// LOTES.JS — GESTÃO DE LOTES (SUPABASE) — VERSÃO ESTÁVEL
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

  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.warn('❌ Erro ao carregar lotes do Supabase:', error.message);
      alert('Falha ao carregar lotes do banco. Fallback para localStorage.');
      carregarLotesLocal();
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

  } catch (err) {
    console.error('Erro geral ao carregar lotes:', err);
    alert('Erro ao carregar lotes do Supabase. Usando dados locais.');
    carregarLotesLocal();
  }

  // Atualiza UI
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
};

// ----------------------------------
// Fallback local
// ----------------------------------
function carregarLotesLocal() {
  const data = localStorage.getItem('gaylords-system-state');
  if (!data) return;

  const parsed = JSON.parse(data);
  state.lotes = (parsed.lotes || []).map(lote => ({
    id: lote.id || crypto.randomUUID(),
    nome: lote.nome,
    total: Number(lote.total) || 0,
    saldo: Number(lote.saldo ?? lote.total) || 0,
    ativo: lote.ativo ?? true,
    cor: lote.cor || gerarCor()
  }));

  console.log('⚠️ Lotes carregados do localStorage:', state.lotes);

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
}

// ----------------------------------
// CRIAR LOTE (BANCO + LOCAL)
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

  console.log('📦 Criando lote no Supabase:', { nome, total });

  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar lote no banco:', error);
      alert('Erro ao criar lote no banco. Verifique console.');
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

    // Limpar inputs
    nomeInput.value = '';
    totalInput.value = '';

    // Atualiza UI
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();

    console.log('✅ Lote criado com sucesso:', novoLote);
  } catch (err) {
    console.error('Erro inesperado ao criar lote:', err);
    alert('Erro inesperado. Veja console para detalhes.');
  }
};

// ----------------------------------
// BOOTSTRAP
// ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
