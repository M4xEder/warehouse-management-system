// =======================================
// SUPABASE.JS — INICIALIZAÇÃO GLOBAL
// =======================================

console.log('supabase.js carregado');

// ⚠️ COLOQUE SUAS CHAVES AQUI
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_AQUI';

// Criar client UMA ÚNICA VEZ
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('✅ Supabase conectado');
