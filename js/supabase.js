//l// =======================================
// SUPABASE.JS — CONEXÃO
// =======================================

const SUPABASE_URL = 'https://fctxvszjqhkfstzqgvat.supabase.co';
const SUPABASE_ANON_KEY =
  'sb_publishable_MGb2JD0gYRYvihRdAbSEiQ_eeyu8tie';

// Cria cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase conectado:', supabase);

// ===============================
// BUSCAR LOTES DO BANCO
// ===============================
window.carregarLotesDoBanco = async function () {
  try {
    const { data, error } = await supabase
      .from('lotes')
      .select('*')
      .order('criado_em', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar lotes:', error);
      return [];
    }

    if (!data) return [];

    console.log('✅ Lotes carregados do banco:', data);
    return data;
  } catch (err) {
    console.error('❌ Erro geral carregarLotesDoBanco:', err);
    return [];
  }
};

// ===============================
// CRIAR LOTE NO BANCO
// ===============================
window.criarLoteNoBanco = async function (nome, total) {
  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert([{ nome, total_gaylords: total }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar lote no banco:', error);
      return null;
    }

    console.log('✅ Lote criado no banco:', data);
    return data;
  } catch (err) {
    console.error('❌ Erro geral criarLoteNoBanco:', err);
    return null;
  }
};
