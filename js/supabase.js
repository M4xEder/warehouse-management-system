// ===============================
// SUPABASE.JS — CONFIGURAÇÃO BASE
// ===============================

// 🔐 CONFIGURAÇÃO DO SEU PROJETO
// ⚠️ CONFIRA SE ESTÃO CORRETAS
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-CHAVE-ANONIMA';

// Cliente Supabase
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('Supabase conectado');

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
