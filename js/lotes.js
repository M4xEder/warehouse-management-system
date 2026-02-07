// =======================================
// LOTES.JS — GESTÃO DE LOTES (SUPABASE + LOCAL)
// =======================================

console.log('lotes.js carregado');

// -------------------------------
// GERAR COR FIXA POR LOTE
// -------------------------------
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// -------------------------------
// CARREGAR LOTES (BANCO → STATE)
// -------------------------------
window.carregarLotes = async function () {
  console.log('🔄 Carregando lotes do Supabase...');

  const lotesDoBanco = await carregarLotesDoBanco();

  if (lotesDoBanco.length === 0) {
    console.warn('⚠️ Nenhum lote do banco. Usando localStorage');
    carregarLocal();
    return;
  }

  state.lotes = lotesDoBanco.map(l => ({
    id: l.id,
    nome: l.nome,
    total: l.total_gaylords,
    saldo: l.total_gaylords,
    ativo: true,
    cor: gerarCor()
  }));

  console.log('✅ Lotes carregados no state:', state.lotes);

  renderDashboard?.();
  renderMapa?.();
};

// -------------------------------
// CRIAR LOTE (FRONT + BANCO)
// -------------------------------
window.cadastrarLote = async function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return alert('Campos de lote não encontrados');

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) return alert('Informe nome e quantidade válida');

  if (state.lotes.some(l => l.nome === nome)) return alert('Lote já existe');

  console.log('📦 Criando lote:', nome);

  const loteCriado = await criarLoteNoBanco(nome, total);

  if (!loteCriado) {
    alert('Erro ao criar lote no banco');
    return;
  }

  const novoLote = {
    id: loteCriado.id,
    nome: loteCriado.nome,
    total: loteCriado.total_gaylords,
    saldo: loteCriado.total_gaylords,
    ativo: true,
    cor: gerarCor()
  };

  state.lotes.push(novoLote);

  nomeInput.value = '';
  totalInput.value = '';

  renderDashboard?.();
  renderMapa?.();

  console.log('✅ Lote criado com sucesso:', novoLote);
};

// -------------------------------
// BOOTSTRAP
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
