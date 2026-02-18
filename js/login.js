// =======================================
// LOGIN.JS — CONTROLE COMPLETO DE SESSÃO
// SUPABASE AUTH (PRODUÇÃO)
// =======================================

console.log('login.js carregado');


// =======================================
// CONFIGURAÇÃO SUPABASE
// =======================================

const SUPABASE_URL = 'https://zegbjftbyckttcdrfwgf.supabase.co';

const SUPABASE_KEY = 'SUA_PUBLIC_ANON_KEY_AQUI';

if (!window.supabase) {
  console.error('Supabase SDK não carregado.');
}

// 🔥 CLIENTE GLOBAL PADRONIZADO
window.supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =======================================
// LOGIN
// =======================================

window.fazerLogin = async function () {

  const email = document.getElementById('usuario')?.value.trim();
  const senha = document.getElementById('senha')?.value.trim();
  const erro = document.getElementById('errorLogin');

  if (erro) erro.textContent = '';

  if (!email || !senha) {
    if (erro) erro.textContent = 'Informe email e senha';
    return;
  }

  try {

    const { error } = await window.supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      if (erro) erro.textContent = 'Email ou senha inválidos';
      return;
    }

    window.location.replace('index.html');

  } catch (err) {
    console.error(err);
    if (erro) erro.textContent = 'Erro ao conectar com servidor';
  }
};


// =======================================
// CHECAR SESSÃO
// =======================================

window.checarSessao = async function () {

  const { data } = await window.supabase.auth.getSession();

  if (!data.session) {
    window.location.replace('login.html');
    return false;
  }

  return true;
};


// =======================================
// MOSTRAR USUÁRIO
// =======================================

window.mostrarUsuarioLogado = async function () {

  const { data } = await window.supabase.auth.getUser();

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

  await window.supabase.auth.signOut();
  window.location.replace('login.html');

};


// =======================================
// PROTEÇÃO + INICIALIZAÇÃO
// =======================================

document.addEventListener('DOMContentLoaded', async function () {

  const paginaAtual = window.location.pathname.split('/').pop();

  // 🔐 Se estiver na tela de login
  if (paginaAtual === 'login.html') {

    const { data } = await window.supabase.auth.getSession();

    if (data.session) {
      window.location.replace('index.html');
    }

    return;
  }

  // 🔐 Proteger outras páginas
  const sessaoValida = await window.checarSessao();

  if (!sessaoValida) return;

  // 👤 Mostrar usuário
  await window.mostrarUsuarioLogado();

  // 🔥 CARREGAR DADOS DO SISTEMA
  if (typeof loadFromDatabase === 'function') {
    await loadFromDatabase();
  }

});


// =======================================
// EVENTO BOTÃO LOGIN
// =======================================

document.addEventListener('DOMContentLoaded', function () {

  const btn = document.getElementById('btnLogin');

  if (btn) {
    btn.addEventListener('click', window.fazerLogin);
  }

});
