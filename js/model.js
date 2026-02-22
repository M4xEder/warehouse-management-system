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

// Buscar todas áreas
window.dbBuscarAreas = async function () {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};


// Criar área
window.dbCriarArea = async function (nome) {
  const { data, error } = await supabase
    .from('areas')
    .insert([{ nome }])
    .select()
    .single();

  return { data, error };
};


// Deletar área
window.dbDeletarArea = async function (id) {
  const { error } = await supabase
    .from('areas')
    .delete()
    .eq('id', id);

  return { error };
};



// ======================================
// RUAS
// ======================================

window.dbBuscarRuas = async function () {
  const { data, error } = await supabase
    .from('ruas')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};

window.dbCriarRua = async function (area_id, nome) {
  const { data, error } = await supabase
    .from('ruas')
    .insert([{ area_id, nome }])
    .select()
    .single();

  return { data, error };
};

window.dbDeletarRua = async function (id) {
  const { error } = await supabase
    .from('ruas')
    .delete()
    .eq('id', id);

  return { error };
};



// ======================================
// POSIÇÕES
// ======================================

window.dbBuscarPosicoes = async function () {
  const { data, error } = await supabase
    .from('posicoes')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};


// Criar posição
window.dbCriarPosicao = async function (rua_id, numero) {
  const { data, error } = await supabase
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


// Atualizar posição (alocar lote)
window.dbAtualizarPosicao = async function (id, payload) {
  const { data, error } = await supabase
    .from('posicoes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};


// Liberar posição
window.dbLiberarPosicao = async function (id) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from('lotes')
    .select('*')
    .order('created_at', { ascending: true });

  return { data, error };
};

window.dbCriarLote = async function (nome) {
  const { data, error } = await supabase
    .from('lotes')
    .insert([{ nome }])
    .select()
    .single();

  return { data, error };
};

window.dbDeletarLote = async function (id) {
  const { error } = await supabase
    .from('lotes')
    .delete()
    .eq('id', id);

  return { error };
};



// ======================================
// HISTÓRICO DE EXPEDIÇÃO
// ======================================

window.dbBuscarHistorico = async function () {
  const { data, error } = await supabase
    .from('historico_expedidos')
    .select('*')
    .order('created_at', { ascending: false });

  return { data, error };
};

window.dbRegistrarExpedicao = async function (payload) {
  const { data, error } = await supabase
    .from('historico_expedidos')
    .insert([payload])
    .select()
    .single();

  return { data, error };
};
