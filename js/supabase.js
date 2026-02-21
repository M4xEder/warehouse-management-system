// =======================================
// SUPABASE.JS — INICIALIZAÇÃO GLOBAL
// =======================================

console.log('supabase.js carregado');

// ⚠️ COLOQUE SUAS CHAVES AQUI
const PROJET URL = 'https://zegbjftbyckttcdrfwgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZ2JqZnRieWNrdHRjZHJmd2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzAwNTAsImV4cCI6MjA4Njg0NjA1MH0.YdgrUkSnJ8ew2uMlU5Wdcd4k9iU4GSO0_vyNH1HT-lc';

// Criar client UMA ÚNICA VEZ
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('✅ Supabase conectado');
