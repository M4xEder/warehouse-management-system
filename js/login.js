// =======================================
// LOGIN.JS — CONTROLE COMPLETO DE SESSÃO
// INTEGRADO AO SUPABASE 
// =======================================

console.log('login.js carregado');

// 🔹 CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = 'SUA_URL_AQUI';
const SUPABASE_KEY = 'SUA_PUBLISHABLE_KEY_AQUI';

// Criando cliente com nome diferente para evitar conflito
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// Tempo máximo da sessão (8 horas)
const TEMPO_MAXIMO_SESSAO = 8 * 60 * 60 * 1000;


// ===============================
// LOGIN
// ===============================
window.fazerLogin = async function () {

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

  try {

    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('usuario', usuario)
      .eq('senha', senha)
      .single();

    if (error || !data) {
      if (erro) erro.textContent = 'Usuário ou senha inválidos';
      return;
    }

    // Salva sessão local
    localStorage.setItem('usuarioLogado', JSON.stringify({
      id: data.id,
      usuario: data.usuario,
      dataLogin: Date.now()
    }));

    window.location.replace('index.html');

  } catch (e) {
    console.error('Erro no login:', e);
    if (erro) erro.textContent = 'Erro ao conectar com servidor';
  }
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
