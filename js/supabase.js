// =======================================
// SUPABASE.JS
// =======================================

const SUPABASE_URL = 'https://fctxvszjqhkfstzqgvat.supabase.co';

// ⚠️ Use APENAS a Publishable Key (anon)
const SUPABASE_ANON_KEY =
  'sb_publishable_MGb2JD0gYRYvihRdAbSEiQ_eeyu8tie';

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Debug opcional
console.log('Supabase conectado:', supabase);// ===============================
// BUSCAR LOTES DO BANCO
// ===============================
async function carregarLotesDoBanco() {
  const { data, error } = await supabase
    .from('lotes')
    .select('*')
    .order('criado_em', { ascending: true });

  if (error) {
    console.error('Erro ao buscar lotes:', error.message);
    return [];
  }

  console.log('Lotes carregados do banco:', data);
  return data;
}
