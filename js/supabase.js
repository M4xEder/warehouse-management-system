// =======================================
// SUPABASE.JS — CONEXÃO GLOBAL
// =======================================

// ⚠️ SEM barra no final da URL
const SUPABASE_URL = 'https://fctxvszjqhkfstzqgvat.supabase.co';

// ⚠️ Use a chave "Publishable (anon public)" do painel
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZ2JqZnRieWNrdHRjZHJmd2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzAwNTAsImV4cCI6MjA4Njg0NjA1MH0.YdgrUkSnJ8ew2uMlU5Wdcd4k9iU4GSO0_vyNH1HT-lc';

// 🔥 CRIA CLIENTE GLOBAL
window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('✅ Supabase inicializado com sucesso');
