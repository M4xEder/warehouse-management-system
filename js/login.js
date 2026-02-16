// =======================================
// LOGIN.JS — AUTH REAL SUPABASE
// =======================================

console.log('login.js carregado');

// CONFIG
const SUPABASE_URL = 'https://zegbjftbyckttcdrfwgf.supabase.co';
const SUPABASE_KEY = 'SUA_ANON_KEY_AQUI';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ===============================
// LOGIN
// ===============================
window.fazerLogin = async function () {

  const email = document.getElementById('usuario')?.value.trim();
  const senha = document.getElementById('senha')?.value.trim();
  const erro = document.getElementById('errorLogin');

  if (erro) erro.textContent = '';

  if (!email || !senha) {
    if (erro) erro.textContent = 'Informe email e senha';
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: senha
  });

  if (error) {
    if (erro) erro.textContent = 'Email ou senha inválidos';
    return;
  }

  window.location.replace('index.html');
};


// ===============================
// CHECAR SESSÃO
// ===============================
window.checarSessao = async function () {

  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.replace('login.html');
    return false;
  }

  return true;
};


// ===============================
// LOGOUT
// ===============================
window.logout = async function () {
  await supabaseClient.auth.signOut();
  window.location.replace('login.html');
};


// ===============================
// PROTEÇÃO AUTOMÁTICA
// ===============================
document.addEventListener('DOMContentLoaded', async function () {

  const paginaAtual = window.location.pathname.split('/').pop();

  if (paginaAtual === 'login.html') {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      window.location.replace('index.html');
    }

    return;
  }

  await window.checarSessao();
});
