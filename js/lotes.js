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

  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('❌ Erro ao carregar lotes do Supabase:', error.message);
      alert('Erro ao carregar lotes do banco. Usando dados locais.');
      return carregarLotesLocal();
    }

    if (!data || !Array.isArray(data)) {
      console.warn('❌ Dados retornados do Supabase inválidos');
      return carregarLotesLocal();
    }

    state.lotes = data.map(l => ({
      id: l.id,
      nome: l.nome,
      total: l.total_gaylords,
      saldo: l.total_gaylords,
      ativo: true,
      cor: l.cor || gerarCor()
    }));

    console.log('✅ Lotes carregados do Supabase:', state.lotes);

    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();
  } catch (err) {
    console.error('❌ Falha geral ao carregar lotes:', err);
    alert('Erro inesperado ao carregar lotes. Usando dados locais.');
    carregarLotesLocal();
  }
};

// ----------------------------------
// FALLBACK LOCAL
// ----------------------------------
function carregarLotesLocal() {
  const data = localStorage.getItem('gaylords-system-state');
  if (!data) return;

  const parsed = JSON.parse(data);
  state.lotes = (parsed.lotes || []).map(l => ({
    id: l.id || crypto.randomUUID(),
    nome: l.nome,
    total: Number(l.total) || 0,
    saldo: Number(l.saldo ?? l.total) || 0,
    ativo: l.ativo ?? true,
    cor: l.cor || gerarCor()
  }));

  console.log('⚠️ Lotes carregados do localStorage:', state.lotes);

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
}

// ----------------------------------
// CRIAR LOTE (SUPABASE + STATE)
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

  if (state.lotes.some(l => l.nome === nome)) {
    alert('Lote já existe');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar lote no Supabase:', error.message);
      alert('Erro ao criar lote no banco');
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
  } catch (err) {
    console.error('❌ Falha inesperada ao criar lote:', err);
    alert('Erro inesperado ao criar lote');
  }
};

// ----------------------------------
// BOOTSTRAP
// ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
