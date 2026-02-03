// ===============================
// MODEL.JS — REGRAS DO DOMÍNIO
// ===============================

// ---------- POSIÇÃO ----------
function criarPosicao() {
  return {
    lote: null,
    rz: null,
    volume: null,
    ocupada: false
  };
}

// ---------- RUA ----------
function criarRua(nome, quantidade) {
  return {
    id: crypto.randomUUID(),
    nome,
    posicoes: Array.from(
      { length: quantidade },
      () => criarPosicao()
    )
  };
}

// ---------- ÁREA ----------
function criarArea(nome) {
  return {
    id: crypto.randomUUID(),
    nome,
    ruas: []
  };
}

// ---------- LOTE ----------
function criarLote(nome, total, cor) {
  return {
    id: crypto.randomUUID(),
    nome,
    total,
    cor,
    expedido: 0
  };
}

// ===============================
// OPERAÇÕES DE NEGÓCIO
// ===============================

function podeExcluirArea(area) {
  return !area.ruas.some(rua =>
    rua.posicoes.some(p => p.ocupada)
  );
}

function podeExcluirRua(rua) {
  return !rua.posicoes.some(p => p.ocupada);
}

function ocuparPosicao(pos, { lote, rz, volume }) {
  pos.lote = lote;
  pos.rz = rz;
  pos.volume = volume || '';
  pos.ocupada = true;
}

function liberarPosicao(pos) {
  pos.lote = null;
  pos.rz = null;
  pos.volume = null;
  pos.ocupada = false;
}

function expedirPosicao(pos) {
  if (!pos.ocupada) return false;

  liberarPosicao(pos);
  return true;
}

// ===============================
// EXPORT GLOBAL
// ===============================
window.Model = {
  criarArea,
  criarRua,
  criarLote,
  criarPosicao,
  podeExcluirArea,
  podeExcluirRua,
  ocuparPosicao,
  liberarPosicao,
  expedirPosicao
};
