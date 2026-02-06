// =======================================
// LOTES.JS — GESTÃO DE LOTES (SUPABASE)
// =======================================

console.log('lotes.js carregado');

// -------------------------------
// GERAR COR FIXA POR LOTE
// -------------------------------
function gerarCor() {
  return `hsl(${Math.random() * 360}, 70%, 65%)`;
}

// -------------------------------
// CARREGAR LOTES DO BANCO
// -------------------------------
window.carregarLotes = async function () {
  console.log('🔄 Carregando lotes do Supabase...');

  try {
    const lotesDB = await carregarLotesDoBanco(); // função do supabase.js

    if (!lotesDB || !Array.isArray(lotesDB)) {
      console.warn('Nenhum lote retornado do banco, fallback para localStorage');
      carregarLocal();
      return;
    }

    // Normaliza lotes
    state.lotes = lotesDB.map(l => ({
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
    console.error('❌ Erro geral ao carregar lotes:', err);
    carregarLocal();
  }
};

// -------------------------------
// CRIAR LOTE (BANCO + FRONT)
// -------------------------------
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

  // 🔒 Evita criar lote se alguma posição já tem esse nome (mesmo se foi expedido)
  const alocado = state.areas.some(area =>
    area.ruas.some(rua =>
      rua.posicoes.some(pos => pos.lote === nome)
    )
  );
  if (alocado) {
    alert('Não é possível criar lote: nome já está alocado em alguma posição');
    return;
  }

  try {
    // Inserir no banco
    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar lote no banco:', error.message);
      alert('Erro ao salvar lote no banco');
      return;
    }

    // Atualiza state
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
    console.error('❌ Erro geral cadastrarLote:', err);
    alert('Erro ao criar lote');
  }
};

// -------------------------------
// Fallback localStorage (caso Supabase falhe)
// -------------------------------
function carregarLocal() {
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

  console.log('✅ Lotes carregados do localStorage:', state.lotes);

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
}

// -------------------------------
// BOOTSTRAP
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
