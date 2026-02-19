// =======================================
// SUPABASE.JS — CONEXÃO GLOBAL
// =======================================

// ⚠️ SEM barra no final da URL
const SUPABASE_URL = 'https://fctxvszjqhkfstzqgvat.supabase.co';

// ⚠️ Use a chave "Publishable (anon public)" do painel
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';

// 🔥 CRIA CLIENTE GLOBAL
window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('✅ Supabase inicializado com sucesso');
