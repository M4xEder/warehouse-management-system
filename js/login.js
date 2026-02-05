// =======================================
// LOGIN.JS — CONTROLE DE SESSÃO
// =======================================

console.log('login.js carregado');

// ===============================
// LOGIN
// ===============================
window.fazerLogin = function() {
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const erro = document.getElementById('errorLogin');

  erro.textContent = '';

  if (!usuario || !senha) {
    erro.textContent = 'Informe usuário e senha';
    return;
  }

  // Usuários válidos (exemplo)
  const usuariosValidos = [
    { usuario: 'admin', senha: '1234' },
    { usuario: 'user', senha: 'abcd' }
  ];

  const valido = usuariosValidos.find(u => u.usuario === usuario && u.senha === senha);

  if (!valido) {
    erro.textContent = 'Usuário ou senha inválidos';
    return;
  }

  // Login bem-sucedido → salva sessão
  localStorage.setItem('usuarioLogado', JSON.stringify({ usuario }));

  // Redireciona para o sistema
  window.location.href = 'index.html';
};

// ===============================
// CHECAR SESSÃO (para páginas protegidas)
// ===============================
window.checarSessao = function() {
  const usuario = localStorage.getItem('usuarioLogado');
  if (!usuario) {
    // Se não estiver logado, volta para login
    window.location.href = 'login.html';
  }
};

// ===============================
// LOGOUT
// ===============================
window.logout = function() {
  localStorage.removeItem('usuarioLogado');
  window.location.href = 'login.html';
};
