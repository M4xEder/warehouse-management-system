// ==================================
// LOTES.JS — GESTÃO DE LOTES (SUPABASE ESTÁVEL)
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
    saldo: l.total_gaylords,
    ativo: true,
    cor: gerarCor()
  }));

  console.log('✅ Lotes carregados:', state.lotes);

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();
};

// ----------------------------------
// CRIAR LOTE (BANCO + FRONT)
// ----------------------------------
window.cadastrarLote = async function () {
  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return alert('Campos de lote não encontrados');

  const nome = nomeInput.value.trim();
  const total = Number(totalInput.value);

  if (!nome || total <= 0) return alert('Informe nome e quantidade válida');

  // 🔒 Evita duplicado no front
  if (state.lotes.some(l => l.nome === nome)) {
    return alert('Lote já existe');
  }

  // 🔒 Evita conflito com lotes alocados
  const loteOcupado = state.areas.some(area =>
    area.ruas.some(rua =>
      rua.posicoes.some(pos => pos.lote === nome)
    )
  );
  if (loteOcupado) {
    return alert('Não é possível criar um lote que já está alocado em alguma posição');
  }

  console.log('📦 Criando lote:', nome);

  const { data, error } = await supabase
    .from('lotes')
    .insert([{ nome, total_gaylords: total }])
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao criar lote:', error.message);
    return alert('Erro ao salvar lote no banco');
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
// REMOVER LOTE (APENAS FRONT, SEM AFETAR HISTÓRICO)
// ----------------------------------
window.removerLote = function (loteNome) {
  const confirmDel = confirm(`Deseja realmente remover o lote "${loteNome}"?`);
  if (!confirmDel) return;

  // Verifica se lote está alocado
  const alocado = state.areas.some(area =>
    area.ruas.some(rua =>
      rua.posicoes.some(pos => pos.lote === loteNome)
    )
  );
  if (alocado) return alert('Não é possível remover um lote que está alocado no mapa');

  state.lotes = state.lotes.filter(l => l.nome !== loteNome);

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderMapa === 'function') renderMapa();

  console.log(`✅ Lote "${loteNome}" removido`);
};

// ----------------------------------
// VALIDAR ALOCAR LOTE (IMPEDIR EXPEDIDO OU SUBSTITUIR)
// ----------------------------------
window.validarAlocacao = function (nomeLote, posicao) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return false;

  // Lote já foi expedido?
  const expedido = state.historicoExpedidos.some(e => e.lote === nomeLote);
  if (expedido) {
    alert('Este lote já foi expedido e não pode ser alocado novamente');
    return false;
  }

  // Posição já ocupada por outro lote?
  if (posicao.lote && posicao.lote !== nomeLote) {
    alert('Esta posição já possui outro lote. Remova antes de substituir.');
    return false;
  }

  return true;
};

// ----------------------------------
// BOOTSTRAP
// ----------------------------------
document.addEventListener('DOMContentLoaded', () => {
  carregarLotes();
});
