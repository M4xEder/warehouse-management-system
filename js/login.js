// =======================================
// LOGIN.JS — CONTROLE DE SESSÃO
// =======================================

console.log('login.js carregado');


// =======================================
// LOGIN
// =======================================

window.fazerLogin = async function () {

  if (!window.supabaseClient) {
    console.error("❌ Supabase não inicializado");
    return;
  }

  const email = document.getElementById('usuario')?.value.trim();
  const senha = document.getElementById('senha')?.value.trim();
  const erro = document.getElementById('errorLogin');

  if (erro) erro.textContent = '';

  if (!email || !senha) {
    if (erro) erro.textContent = 'Informe email e senha';
    return;
  }

  try {

    const { error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      if (erro) erro.textContent = 'Email ou senha inválidos';
      return;
    }

    window.location.replace('index.html');

  } catch (err) {
    console.error("Erro no login:", err);
    if (erro) erro.textContent = 'Erro ao conectar com servidor';
  }
};


// =======================================
// CHECAR SESSÃO
// =======================================

window.checarSessao = async function () {

  if (!window.supabaseClient) {
    console.error("❌ Supabase não inicializado");
    return false;
  }

  const { data, error } = await window.supabaseClient.auth.getSession();

  if (error) {
    console.error("Erro ao verificar sessão:", error);
    return false;
  }

  if (!data.session) {
    window.location.replace('login.html');
    return false;
  }

  return true;
};


// =======================================
// MOSTRAR USUÁRIO LOGADO
// =======================================

window.mostrarUsuarioLogado = async function () {

  if (!window.supabaseClient) return;

  const { data } = await window.supabaseClient.auth.getUser();

  if (!data?.user) return;

  const elemento = document.getElementById('usuarioHeader');

  if (elemento) {
    elemento.textContent = `Usuário: ${data.user.email}`;
  }
};


// =======================================
// LOGOUT
// =======================================

window.logout = async function () {

  if (!window.supabaseClient) return;

  await window.supabaseClient.auth.signOut();
  window.location.replace('login.html');
};


// =======================================
// INICIALIZAÇÃO GLOBAL
// =======================================

document.addEventListener('DOMContentLoaded', async function () {

  if (!window.supabaseClient) {
    console.error("❌ Supabase não inicializado");
    return;
  }

  const paginaAtual = window.location.pathname.split('/').pop();

  // =============================
  // SE ESTIVER NA TELA LOGIN
  // =============================
  if (paginaAtual === 'login.html' || paginaAtual === '') {

    const { data } = await window.supabaseClient.auth.getSession();

    if (data?.session) {
      window.location.replace('index.html');
    }

    const btn = document.getElementById('btnLogin');
    if (btn) {
      btn.addEventListener('click', window.fazerLogin);
    }

    return;
  }

  // =============================
  // QUALQUER OUTRA TELA
  // =============================
  const sessaoValida = await window.checarSessao();
  if (!sessaoValida) return;

  await window.mostrarUsuarioLogado();

  if (typeof window.loadFromDatabase === 'function') {
    await window.loadFromDatabase();
  }

});
