// =======================================
// LOGIN.JS — CONTROLE COMPLETO DE SESSÃO
// =======================================

console.log('login.js carregado');

// Tempo máximo de sessão (8 horas)
const TEMPO_MAXIMO_SESSAO = 8 * 60 * 60 * 1000;

// ===============================
// LOGIN
// ===============================
window.fazerLogin = function () {

  const usuarioInput = document.getElementById('usuario');
  const senhaInput = document.getElementById('senha');
  const erro = document.getElementById('errorLogin');

  const usuario = usuarioInput?.value.trim();
  const senha = senhaInput?.value.trim();

  if (erro) erro.textContent = '';

  if (!usuario || !senha) {
    if (erro) erro.textContent = 'Informe usuário e senha';
    return;
  }

  // Usuários válidos
  const usuariosValidos = [
    { usuario: 'admin', senha: '1234' },
    { usuario: 'meli', senha: 'meli+02' }
  ];

  const valido = usuariosValidos.find(
    u => u.usuario === usuario && u.senha === senha
  );

  if (!valido) {
    if (erro) erro.textContent = 'Usuário ou senha inválidos';
    return;
  }

  // Salva sessão
  localStorage.setItem('usuarioLogado', JSON.stringify({
    usuario,
    dataLogin: Date.now()
  }));

  // Redireciona
  window.location.replace('index.html');
};


// ===============================
// CHECAR SESSÃO
// ===============================
window.checarSessao = function () {

  const dadosSalvos = localStorage.getItem('usuarioLogado');

  if (!dadosSalvos) {
    redirecionarParaLogin();
    return;
  }

  try {
    const dados = JSON.parse(dadosSalvos);

    if (!dados.usuario || !dados.dataLogin) {
      redirecionarParaLogin();
      return;
    }

    const agora = Date.now();

    // Verifica expiração
    if (agora - dados.dataLogin > TEMPO_MAXIMO_SESSAO) {
      localStorage.removeItem('usuarioLogado');
      redirecionarParaLogin();
    }

  } catch (e) {
    localStorage.removeItem('usuarioLogado');
    redirecionarParaLogin();
  }
};


// ===============================
// LOGOUT
// ===============================
window.logout = function () {
  localStorage.removeItem('usuarioLogado');
  redirecionarParaLogin();
};


// ===============================
// MOSTRAR USUÁRIO LOGADO (opcional)
// ===============================
window.mostrarUsuarioLogado = function () {
  const dadosSalvos = localStorage.getItem('usuarioLogado');
  if (!dadosSalvos) return;

  const dados = JSON.parse(dadosSalvos);
  const elemento = document.getElementById('usuarioLogado');

  if (elemento && dados.usuario) {
    elemento.textContent = `Usuário: ${dados.usuario}`;
  }
};


// ===============================
// REDIRECIONAMENTO
// ===============================
function redirecionarParaLogin() {
  if (!window.location.pathname.includes('login.html')) {
    window.location.replace('login.html');
  }
}


// ===============================
// PROTEÇÃO AUTOMÁTICA
// ===============================
document.addEventListener('DOMContentLoaded', function () {

  // Se NÃO estiver na tela de login → exige sessão
  if (!window.location.pathname.includes('login.html')) {
    window.checarSessao();
    window.mostrarUsuarioLogado();
  }

});
