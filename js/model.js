// ===============================
// MODEL.JS — CAMADA DE DADOS SUPABASE (VERSÃO FINAL SEM STATUS)
// ===============================
//
// ✔ CRUD padronizado
// ✔ Sempre retorna { data, error }
// ✔ Sem coluna status
// ✔ Status calculado dinamicamente
// ✔ Compatível com Realtime
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
      ocupada: false,
      lote_id: null,
      volume: null,
      rz: null
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
      lote_id: null,
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

window.dbCriarLote = async function (nome, quantidade, cor) {
  const { data, error } = await window.supabaseClient
    .from('lotes')
    .insert([{
      nome,
      quantidade,
      cor
    }])
    .select()
    .single();

  return { data, error };
};

window.dbAtualizarLote = async function (id, payload) {
  const { data, error } = await window.supabaseClient
    .from('lotes')
    .update(payload)
    .eq('id', id)
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
    .order('data_expedicao', { ascending: false });

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



// ======================================
// 📦 RESUMO COMPLETO DO LOTE
// ======================================

window.dbBuscarResumoLoteExpedido = async function (loteId) {

  try {

    const { data: lote, error: erroLote } =
      await window.supabaseClient
        .from('lotes')
        .select('*')
        .eq('id', loteId)
        .single();

    if (erroLote) throw erroLote;

    const { data: historico, error: erroHist } =
      await window.supabaseClient
        .from('historico_expedidos')
        .select('*')
        .eq('lote_id', loteId)
        .order('data_expedicao', { ascending: false });

    if (erroHist) throw erroHist;

    const totalExpedido = historico.length;

    const volumeTotal = historico.reduce((acc, item) =>
      acc + Number(item.volume || 0), 0
    );

    const primeiraData = historico.length
      ? historico[historico.length - 1].data_expedicao
      : null;

    const ultimaData = historico.length
      ? historico[0].data_expedicao
      : null;

    return {
      data: {
        lote,
        totalExpedido,
        volumeTotal,
        primeiraData,
        ultimaData,
        historico
      },
      error: null
    };

  } catch (error) {
    console.error('Erro ao buscar resumo do lote:', error);
    return { data: null, error };
  }
};



// ======================================
// 📦 LISTAR LOTES TOTALMENTE EXPEDIDOS
// ======================================

window.dbBuscarLotesExpedidosComResumo = async function () {

  try {

    const { data: lotes, error } =
      await window.supabaseClient
        .from('lotes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    const resultado = [];

    for (const lote of lotes) {

      const { data: historico } =
        await window.supabaseClient
          .from('historico_expedidos')
          .select('*')
          .eq('lote_id', lote.id);

      const totalExpedido = historico.length;

      if (totalExpedido >= Number(lote.quantidade)) {

        const volumeTotal = historico.reduce((acc, item) =>
          acc + Number(item.volume || 0), 0
        );

        resultado.push({
          ...lote,
          totalExpedido,
          volumeTotal
        });
      }
    }

    return { data: resultado, error: null };

  } catch (error) {
    console.error('Erro ao buscar lotes expedidos:', error);
    return { data: null, error };
  }
};
