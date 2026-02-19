// =======================================
// HEADER.JS — CONTROLE DO HEADER
// =======================================

document.addEventListener('DOMContentLoaded', async () => {

  // Mostrar usuário logado
  if (typeof window.mostrarUsuarioLogado === 'function') {
    await window.mostrarUsuarioLogado();
  }

  const paginaAtual = window.location.pathname.split('/').pop();

  const btnRelatorios = document.getElementById('btnRelatorios');
  const btnVoltar = document.getElementById('btnVoltar');

  // Se estiver na index (Sistema)
  if (paginaAtual === 'index.html') {
    if (btnRelatorios) btnRelatorios.style.display = 'inline-block';
    if (btnVoltar) btnVoltar.style.display = 'none';
  }

  // Se estiver em relatórios
  if (paginaAtual === 'relatorios.html') {
    if (btnRelatorios) btnRelatorios.style.display = 'none';
    if (btnVoltar) btnVoltar.style.display = 'inline-block';
  }

});


// =======================================
// NAVEGAÇÃO
// =======================================

function irRelatorios() {
  window.location.href = 'relatorios.html';
}

function voltarSistema() {
  window.location.href = 'index.html';
}
