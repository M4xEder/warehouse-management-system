// =======================================
// SUPABASE.JS — CONEXÃO
// =======================================

const SUPABASE_URL = 'https://fctxvszjqhkfstzqgvat.supabase.co';
const SUPABASE_ANON_KEY =
  'sb_publishable_MGb2JD0gYRYvihRdAbSEiQ_eeyu8tie';

// Cria cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
      console.error('❌ Erro ao buscar lotes:', error.message);
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
