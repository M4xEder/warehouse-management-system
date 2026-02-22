// ===============================
// MODEL.JS — CAMADA DE DADOS SUPABASE
// ===============================
//
// Regras:
// - NÃO define window.state
// - NÃO usa localStorage
// - Apenas CRUD no banco
// - Sempre retorna { data, error }
//
// ===============================


// ======================================
// ÁREAS
// ======================================

window.dbBuscarAreas = async function () {
  const { data, error } = await window.supabaseClient
    .from('areas')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};

window.dbCriarArea = async function (nome) {
  const { data, error } = await window.supabaseClient
    .from('areas')
    .insert([{ nome }])
    .select()
    .single();

  return { data, error };
};

window.dbDeletarArea = async function (id) {
  const { error } = await window.supabaseClient
    .from('areas')
    .delete()
    .eq('id', id);

  return { error };
};


// ======================================
// RUAS
// ======================================

window.dbBuscarRuas = async function () {
  const { data, error } = await window.supabaseClient
    .from('ruas')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};

window.dbCriarRua = async function (area_id, nome) {
  const { data, error } = await window.supabaseClient
    .from('ruas')
    .insert([{ area_id, nome }])
    .select()
    .single();

  return { data, error };
};

window.dbDeletarRua = async function (id) {
  const { error } = await window.supabaseClient
    .from('ruas')
    .delete()
    .eq('id', id);

  return { error };
};


// ======================================
// POSIÇÕES
// ======================================

window.dbBuscarPosicoes = async function () {
  const { data, error } = await window.supabaseClient
    .from('posicoes')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};

window.dbCriarPosicao = async function (rua_id, numero) {
  const { data, error } = await window.supabaseClient
    .from('posicoes')
    .insert([{
      rua_id,
      numero,
      ocupada: false
    }])
    .select()
    .single();

  return { data, error };
};

window.dbAtualizarPosicao = async function (id, payload) {
  const { data, error } = await window.supabaseClient
    .from('posicoes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

window.dbLiberarPosicao = async function (id) {
  const { data, error } = await window.supabaseClient
    .from('posicoes')
    .update({
      ocupada: false,
      lote: null,
      volume: null,
      rz: null
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};


// ======================================
// LOTES
// ======================================

window.dbBuscarLotes = async function () {
  const { data, error } = await window.supabaseClient
    .from('lotes')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};

window.dbCriarLote = async function (nome) {
  const { data, error } = await window.supabaseClient
    .from('lotes')
    .insert([{ nome }])
    .select()
    .single();

  return { data, error };
};

window.dbDeletarLote = async function (id) {
  const { error } = await window.supabaseClient
    .from('lotes')
    .delete()
    .eq('id', id);

  return { error };
};


// ======================================
// HISTÓRICO DE EXPEDIÇÃO
// ======================================

window.dbBuscarHistorico = async function () {
  const { data, error } = await window.supabaseClient
    .from('historico_expedidos')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

window.dbRegistrarExpedicao = async function (payload) {
  const { data, error } = await window.supabaseClient
    .from('historico_expedidos')
    .insert([payload])
    .select()
    .single();

  return { data, error };
};
