// =======================================
// LOGIN.JS
// =======================================

console.log('login.js carregado');

window.login = function() {
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const erro = document.getElementById('errorLogin');

  erro.textContent = '';

  if (!usuario || !senha) {
    erro.textContent = 'Informe usuário e senha';
    return;
  }

  // Aqui você pode substituir por validação real ou Supabase
  // Exemplo fixo para teste:
  const usuariosValidos = [
    { usuario: 'admin', senha: '1234' },
    { usuario: 'user', senha: 'abcd' }
  ];

  const valido = usuariosValidos.find(u => u.usuario === usuario && u.senha === senha);

  if (!valido) {
    erro.textContent = 'Usuário ou senha inválidos';
    return;
  }

  // Login bem-sucedido → redireciona para index.html
  window.location.href = 'index.html';
};
