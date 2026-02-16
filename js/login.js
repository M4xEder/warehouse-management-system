// =======================================
// LOGIN.JS — CONTROLE COMPLETO DE SESSÃO
// AUTH NATIVO SUPABASE (PRODUÇÃO)
// =======================================

console.log('login.js carregado');

// =======================================
// CONFIGURAÇÃO SUPABASE
// =======================================

const SUPABASE_URL = 'https://zegbjftbyckttcdrfwgf.supabase.co';

const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZ2JqZnRieWNrdHRjZHJmd2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzAwNTAsImV4cCI6MjA4Njg0NjA1MH0.YdgrUkSnJ8ew2uMlU5Wdcd4k9iU4GSO0_vyNH1HT-lc';

if (!window.supabase) {
  console.error('Supabase SDK não carregado. Verifique o script no HTML.');
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =======================================
// LOGIN
// =======================================

window.fazerLogin = async function () {

  const emailInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');
  const erro = document.getElementById('errorLogin');

  const email = emailInput?.value.trim();
  const senha = senhaInput?.value.trim();

  if (erro) erro.textContent = '';

  if (!email || !senha) {
    if (erro) erro.textContent = 'Informe email e senha';
    return;
  }

  try {

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (error) {
      if (erro) erro.textContent = 'Email ou senha inválidos';
      return;
    }

    console.log('Login realizado:', data.user.email);

    window.location.replace('index.html');

  } catch (err) {
    console.error('Erro inesperado:', err);
    if (erro) erro.textContent = 'Erro ao conectar com servidor';
  }
};


// =======================================
// CHECAR SESSÃO
// =======================================

window.checarSessao = async function () {

  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.replace('login.html');
    return false;
  }

  return true;
};


// =======================================
// MOSTRAR USUÁRIO NO HEADER
// =======================================

window.mostrarUsuarioLogado = async function () {

  const { data } = await supabaseClient.auth.getUser();

  if (!data.user) return;

  const elemento = document.getElementById('usuarioHeader');

  if (elemento) {
    elemento.textContent = `Usuário: ${data.user.email}`;
  }
};


// =======================================
// LOGOUT
// =======================================

window.logout = async function () {

  await supabaseClient.auth.signOut();
  window.location.replace('login.html');

};


// =======================================
// PROTEÇÃO AUTOMÁTICA DE PÁGINAS
// =======================================

document.addEventListener('DOMContentLoaded', async function () {

  const paginaAtual = window.location.pathname.split('/').pop();

  // Se estiver na página de login
  if (paginaAtual === 'login.html') {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
      window.location.replace('index.html');
    }

    return;
  }

  // Para qualquer outra página → exige sessão
  const sessaoValida = await window.checarSessao();

  if (sessaoValida) {
    await window.mostrarUsuarioLogado();
  }

});


// =======================================
// EVENTO BOTÃO LOGIN
// =======================================

document.addEventListener('DOMContentLoaded', function () {

  const btn = document.getElementById('btnLogin');

  if (btn) {
    btn.addEventListener('click', function () {
      window.fazerLogin();
    });
  }

});
