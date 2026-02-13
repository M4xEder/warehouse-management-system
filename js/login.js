// =======================================
// LOGIN.JS — CONTROLE COMPLETO DE SESSÃO
// =======================================

console.log('login.js carregado');

// Tempo máximo da sessão (8 horas)
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

  // Usuários permitidos
  const usuariosValidos = [
    { usuario: 'admin', senha: '1234' },
    { usuario: 'meli', senha: 'meli+02' }
  ];

  const usuarioValido = usuariosValidos.find(
    u => u.usuario === usuario && u.senha === senha
  );

  if (!usuarioValido) {
    if (erro) erro.textContent = 'Usuário ou senha inválidos';
    return;
  }

  // Salva sessão
  localStorage.setItem('usuarioLogado', JSON.stringify({
    usuario,
    dataLogin: Date.now()
  }));

  // Vai para o sistema
  window.location.replace('index.html');
};


// ===============================
// CHECAR SESSÃO
// ===============================
window.checarSessao = function () {

  const dadosSalvos = localStorage.getItem('usuarioLogado');

  if (!dadosSalvos) {
    redirecionarParaLogin();
    return false;
  }

  try {
    const dados = JSON.parse(dadosSalvos);

    if (!dados.usuario || !dados.dataLogin) {
      redirecionarParaLogin();
      return false;
    }

    const agora = Date.now();

    // Verifica expiração
    if (agora - dados.dataLogin > TEMPO_MAXIMO_SESSAO) {
      localStorage.removeItem('usuarioLogado');
      redirecionarParaLogin();
      return false;
    }

    return true;

  } catch (e) {
    localStorage.removeItem('usuarioLogado');
    redirecionarParaLogin();
    return false;
  }
};


// ===============================
// LOGOUT
// ===============================
window.logout = function () {
  localStorage.removeItem('usuarioLogado');
  window.location.replace('login.html');
};


// ===============================
// MOSTRAR USUÁRIO NO HEADER
// ===============================
window.mostrarUsuarioLogado = function () {

  const dadosSalvos = localStorage.getItem('usuarioLogado');
  if (!dadosSalvos) return;

  try {
    const dados = JSON.parse(dadosSalvos);
    const elemento = document.getElementById('usuarioHeader');

    if (elemento && dados.usuario) {
      elemento.textContent = `Usuário: ${dados.usuario}`;
    }
  } catch (e) {
    console.error('Erro ao mostrar usuário:', e);
  }
};


// ===============================
// REDIRECIONAMENTO
// ===============================
function redirecionarParaLogin() {
  window.location.replace('login.html');
}


// ===============================
// PROTEÇÃO AUTOMÁTICA DE PÁGINAS
// ===============================
document.addEventListener('DOMContentLoaded', function () {

  const paginaAtual = window.location.pathname.split('/').pop();

  // Se estiver na tela de login
  if (paginaAtual === 'login.html') {

    // Se já estiver logado, não deixa voltar para login
    const dadosSalvos = localStorage.getItem('usuarioLogado');
    if (dadosSalvos) {
      window.location.replace('index.html');
    }

    return;
  }

  // Para qualquer outra página → exige sessão
  const sessaoValida = window.checarSessao();

  if (sessaoValida) {
    window.mostrarUsuarioLogado();
  }

});
