// ======================================================
// UTILS.JS — ENTERPRISE DEFINITIVO UUID SAFE
// ======================================================

// ======================================
// UUID SAFE COMPARAÇÃO
// ======================================
window.idEquals = function (a, b) {
  return String(a) === String(b);
};

// ======================================
// NORMALIZADOR GLOBAL DE OBJETOS
// ======================================
window.normalizeId = function (obj) {
  if (!obj) return obj;

  if (obj.id !== undefined) obj.id = String(obj.id);
  if (obj.lote_id !== undefined) obj.lote_id = String(obj.lote_id);
  if (obj.lote_original_id !== undefined) obj.lote_original_id = String(obj.lote_original_id);
  if (obj.rua_id !== undefined) obj.rua_id = String(obj.rua_id);
  if (obj.area_id !== undefined) obj.area_id = String(obj.area_id);

  return obj;
};

// ======================================
// GERADOR DE UUID (fallback local)
// ======================================
window.gerarUUID = function () {
  return crypto.randomUUID();
};

// ======================================
// FORMATADORES
// ======================================
window.formatarNumero = function (valor) {
  if (!valor) return "0";
  return Number(valor).toLocaleString('pt-BR');
};

window.formatarData = function (dataISO) {
  if (!dataISO) return "-";

  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR') + " " +
         data.toLocaleTimeString('pt-BR');
};

// ======================================
// VALIDAÇÕES
// ======================================
window.isUUID = function (valor) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(valor);
};

window.isEmpty = function (valor) {
  return valor === null ||
         valor === undefined ||
         valor === "" ||
         (typeof valor === "string" && valor.trim() === "");
};

// ======================================
// NOTIFICAÇÃO PADRÃO SISTEMA
// ======================================
window.notificar = function (mensagem, tipo = "info") {

  console.log(`[${tipo.toUpperCase()}] ${mensagem}`);

  // Se tiver sistema de toast no futuro
  // aqui já fica centralizado
};

// ======================================
// CONFIRMAÇÃO PADRÃO
// ======================================
window.confirmar = function (mensagem) {
  return confirm(mensagem);
};

// ======================================
// DEBOUNCE (ANTI DUPLO CLIQUE)
// ======================================
window.debounce = function (fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

// ======================================
// ORDENADORES PADRÃO
// ======================================
window.ordenarPorNumero = function (array, campo) {
  return [...array].sort((a, b) => {
    return Number(a[campo]) - Number(b[campo]);
  });
};

window.ordenarPorTexto = function (array, campo) {
  return [...array].sort((a, b) => {
    return String(a[campo]).localeCompare(String(b[campo]));
  });
};

// ======================================
// AGRUPADOR POR CAMPO
// ======================================
window.agruparPor = function (array, campo) {

  return array.reduce((acc, item) => {

    const chave = item[campo];

    if (!acc[chave]) acc[chave] = [];

    acc[chave].push(item);

    return acc;

  }, {});
};

// ======================================
// SOMADOR GENÉRICO
// ======================================
window.somarCampo = function (array, campo) {
  return array.reduce((total, item) => {
    return total + (Number(item[campo]) || 0);
  }, 0);
};

// ======================================
// FILTRO UUID SAFE
// ======================================
window.filtrarPorId = function (array, campo, valor) {
  return array.filter(item =>
    idEquals(item[campo], valor)
  );
};

// ======================================
// BUSCAR POR ID UUID SAFE
// ======================================
window.buscarPorId = function (array, id) {
  return array.find(item =>
    idEquals(item.id, id)
  );
};

// ======================================
// CLONE SEGURO (IMUTABILIDADE)
// ======================================
window.clonar = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};
