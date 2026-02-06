// =======================================
// SUPABASE.JS — FRONTEND (GITHUB PAGES)
// =======================================

const SUPABASE_URL = 'https://fctxvszjqhkfstzqgvat.supabase.co';

const SUPABASE_ANON_KEY =
  'eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // cola inteira aqui

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('✅ Supabase conectado com sucesso');
// ===============================
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
