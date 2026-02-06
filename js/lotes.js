console.log('lotes.js carregado');

function gerarCor() { return `hsl(${Math.random() * 360}, 70%, 65%)`; }

window.carregarLotes = async function () {
  const { data, error } = await supabase.from('lotes').select('*').order('criado_em', { ascending: true });
  if (error) { console.error(error); return carregarLocal(); }

  state.lotes = data.map(l => ({
    id: l.id,
    nome: l.nome,
    total: l.total_gaylords,
    saldo: l.total_gaylords,
    ativo: true,
    cor: gerarCor()
  }));

  renderDashboard();
  renderMapa();
};

window.cadastrarLote = async function () {
  const nome = document.getElementById('loteNome').value.trim();
  const total = Number(document.getElementById('loteTotal').value);
  if (!nome || total <= 0) return alert('Informe nome e quantidade válida');
  if (state.lotes.some(l => l.nome === nome)) return alert('Lote já existe');

  try {
    const { data, error } = await supabase.from('lotes')
      .insert({ nome, total_gaylords: total }).select().single();
    if (error) throw error;

    state.lotes.push({ id: data.id, nome: data.nome, total: data.total_gaylords, saldo: data.total_gaylords, ativo: true, cor: gerarCor() });

    renderDashboard();
    renderMapa();

    document.getElementById('loteNome').value = '';
    document.getElementById('loteTotal').value = '';
    alert('Lote criado com sucesso ✅');
  } catch (err) {
    console.error('Erro ao criar lote:', err);
    alert('Erro ao criar lote no banco');
  }
};

document.addEventListener('DOMContentLoaded', carregarLotes);
