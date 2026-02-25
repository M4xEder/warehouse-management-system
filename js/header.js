// =======================================
// HEADER.JS — CONTROLE DO HEADER
// =======================================

document.addEventListener('DOMContentLoaded', async () => {

  const container = document.getElementById('header-container');
  if (!container) return;

  try {

    // 🔥 CAMINHO CORRETO
    const response = await fetch('components/header.html');

    if (!response.ok) {
      throw new Error('Header não encontrado');
    }

    const html = await response.text();
    container.innerHTML = html;

    // Mostrar usuário logado
    if (typeof window.mostrarUsuarioLogado === 'function') {
      await window.mostrarUsuarioLogado();
    }

    controlarBotoesPorPagina();

  } catch (err) {
    console.error('Erro ao carregar header:', err);
  }

});


// =======================================
// CONTROLE DE BOTÕES
// =======================================

function controlarBotoesPorPagina() {

  const paginaAtual = window.location.pathname.split('/').pop();

  const btnRelatorios = document.getElementById('btnRelatorios');
  const btnVoltar = document.getElementById('btnVoltar');

  if (!btnRelatorios || !btnVoltar) return;

  if (paginaAtual === 'index.html' || paginaAtual === '') {
    btnRelatorios.style.display = 'inline-block';
    btnVoltar.style.display = 'none';
  }

  if (paginaAtual === 'relatorios.html') {
    btnRelatorios.style.display = 'none';
    btnVoltar.style.display = 'inline-block';
  }
}


// =======================================
// NAVEGAÇÃO
// =======================================

function irRelatorios() {
  window.location.href = 'relatorios.html';
}

function voltarSistema() {
  window.location.href = 'index.html';
}
