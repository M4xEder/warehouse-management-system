// ===============================
// STATE.JS — ESTADO GLOBAL (VERSÃO BANCO)
// ===============================

// Estado central apenas em memória.
// A fonte de verdade agora é o Supabase.

window.state = {
  areas: [],
  lotes: [],
  historicoExpedidos: []
};


// ===============================
// RESETAR ESTADO (UTILITÁRIO DEBUG)
// ===============================
window.resetState = function () {
  state.areas = [];
  state.lotes = [];
  state.historicoExpedidos = [];
};


// ===============================
// LOGAR ESTADO (DEBUG)
// ===============================
window.logState = function () {
  console.log('STATE ATUAL:', JSON.parse(JSON.stringify(state)));
};
