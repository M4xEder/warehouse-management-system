// =======================================
// LOGIN.JS — CONTROLE DE SESSÃO
// =======================================

console.log('login.js carregado');


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
// INICIALIZAÇÃO
// =======================================

document.addEventListener('DOMContentLoaded', async function () {

  const paginaAtual = window.location.pathname.split('/').pop();

  if (paginaAtual === 'login.html') {

    const { data } = await window.supabase.auth.getSession();

    if (data.session) {
      window.location.replace('index.html');
    }

    return;
  }

  const sessaoValida = await window.checarSessao();
  if (!sessaoValida) return;

  await window.mostrarUsuarioLogado();

  if (typeof loadFromDatabase === 'function') {
    await loadFromDatabase();
  }

});


// Evento botão login
document.addEventListener('DOMContentLoaded', function () {

  const btn = document.getElementById('btnLogin');

  if (btn) {
    btn.addEventListener('click', window.fazerLogin);
  }

});
