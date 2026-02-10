// =======================================
// LOGIN.JS — CONTROLE DE SESSÃO
// =======================================

console.log('login.js carregado');

// ===============================
// LOGIN
// ===============================
window.fazerLogin = function () {
  const usuario = document.getElementById('usuario')?.value.trim();
  const senha = document.getElementById('senha')?.value.trim();
  const erro = document.getElementById('errorLogin');

  if (erro) erro.textContent = '';

  if (!usuario || !senha) {
    if (erro) erro.textContent = 'Informe usuário e senha';
    return;
  }

  // Usuários válidos (exemplo)
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

  // Login bem-sucedido → salva sessão
  localStorage.setItem(
    'usuarioLogado',
    JSON.stringify({ usuario, data: Date.now() })
  );

  // Redireciona para o sistema
  window.location.replace('index.html');
};

// ===============================
// CHECAR SESSÃO (PÁGINAS PROTEGIDAS)
// ===============================
window.checarSessao = function () {
  const usuario = localStorage.getItem('usuarioLogado');
  if (!usuario) {
    window.location.replace('login.html');
  }
};

// ===============================
// LOGOUT
// ===============================
window.logout = function () {
  localStorage.removeItem('usuarioLogado');
  window.location.replace('login.html');
};
