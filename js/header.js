document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  if (!header) return;

  header.innerHTML = `
    <header class="app-header">
      <strong>Sistema Gaylords</strong>
      <nav>
        <a href="index.html">Sistema</a>
        <a href="relatorios.html">Relatórios</a>
        <button onclick="logout()">Sair</button>
      </nav>
    </header>
  `;
});
