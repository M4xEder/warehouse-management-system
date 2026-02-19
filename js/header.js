// =======================================
// HEADER.JS — COMPONENTE GLOBAL DE CABEÇALHO
// =======================================

document.addEventListener('DOMContentLoaded', async () => {

  const header = document.getElementById('header');
  if (!header) return;

  header.innerHTML = `
    <header class="app-header">
      <div class="header-left">
        <strong>Sistema Gaylords</strong>
      </div>

      <nav class="header-nav">
        <a href="index.html">Sistema</a>
        <a href="relatorios.html">Relatórios</a>
      </nav>

      <div class="header-right">
        <span id="usuarioHeader"></span>
        <button onclick="logout()">Sair</button>
      </div>
    </header>
  `;

  // Se existir função para mostrar usuário (do login.js), chama
  if (typeof window.mostrarUsuarioLogado === 'function') {
    await window.mostrarUsuarioLogado();
  }

});
