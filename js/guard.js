document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem('user'); // provisório

  const isLoginPage = window.location.pathname.includes('login');

  if (!user && !isLoginPage) {
    // ainda não força redirect enquanto está testando
    console.warn('Usuário não autenticado (guard desativado para testes)');
    return;
  }
});
