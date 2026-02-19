// ===============================
// SUPABASE CLIENT
// ===============================

if (!window.supabase) {
  console.error("Supabase CDN não carregou.");
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Configuração do Supabase não encontrada.");
}

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("Supabase Client inicializado com sucesso.");
