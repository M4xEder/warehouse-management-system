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

  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) throw error;

    // Atualiza estado
    state.lotes = data.map(l => ({
      id: l.id,
      nome: l.nome,
      total: l.total_gaylords,
      saldo: l.total_gaylords,
      ativo: true,
      cor: gerarCor()
    }));

    console.log('✅ Lotes carregados:', state.lotes);

    // Atualiza mapa e dashboard
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();

  } catch (err) {
    console.error('❌ Erro ao carregar lotes do Supabase:', err.message);
    alert('Erro ao carregar lotes do banco. Verifique conexão.');
  }
};

// ----------------------------------
// CRIAR LOTE (BANCO)
// ----------------------------------
window.cadastrarLote = async function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return alert('Campos de lote não encontrados');

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) return alert('Informe nome e quantidade válida');

  // Verifica duplicidade local
  if (state.lotes.some(l => l.nome === nome)) {
    return alert('Lote já existe');
  }

  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) throw error;

    const novoLote = {
      id: data.id,
      nome: data.nome,
      total: data.total_gaylords,
      saldo: data.total_gaylords,
      ativo: true,
      cor: gerarCor()
    };

    state.lotes.push(novoLote);

    // Limpa inputs
    nomeInput.value = '';
    totalInput.value = '';

    // Atualiza dashboard e mapa
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderMapa === 'function') renderMapa();

    console.log('✅ Lote criado com sucesso:', novoLote);

  } catch (err) {
    console.error('❌ Erro ao criar lote:', err.message);
    alert('Erro ao salvar lote no banco: ' + err.message);
  }
};

// ----------------------------------
// BOOTSTRAP
// ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
