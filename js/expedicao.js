// =====================================================
// EXPEDICAO.JS — VERSÃO PROFISSIONAL BLINDADA
// =====================================================

let expedicaoContext = {
  processando: false
};

// =====================================================
// 🔒 VALIDADOR GLOBAL
// =====================================================
function validarStateExpedicao() {
  if (!window.state) throw new Error("State não definido");
  if (!Array.isArray(state.lotes)) state.lotes = [];
  if (!Array.isArray(state.posicoes)) state.posicoes = [];
  if (!Array.isArray(state.ruas)) state.ruas = [];
  if (!Array.isArray(state.areas)) state.areas = [];
}

// =====================================================
// ABRIR MODAL
// =====================================================
window.expedirLote = function (loteId) {

  try {

    validarStateExpedicao();

    if (!loteId) {
      alert("Lote inválido");
      return;
    }

    const lista = document.getElementById('listaExpedicao');
    const modal = document.getElementById('modalExpedicao');

    if (!lista || !modal) {
      console.error("Elementos do modal não encontrados");
      return;
    }

    lista.innerHTML = '';

    const lote = state.lotes.find(l => l.id === loteId);

    if (!lote) {
      alert('Lote não encontrado.');
      return;
    }

    const selecionaveis = state.posicoes.filter(p =>
      p?.ocupada === true &&
      p?.lote_id === lote.id
    );

    if (selecionaveis.length === 0) {
      alert('Nenhuma gaylord alocada neste lote.');
      return;
    }

    selecionaveis.forEach(pos => {

      const rua = state.ruas.find(r => r.id === pos?.rua_id);
      const area = state.areas.find(a => a.id === rua?.area_id);

      const label = document.createElement('label');
      label.className = 'linha-expedicao';

      label.innerHTML = `
        <input
          type="checkbox"
          data-posid="${pos.id}"
          checked
        />
        Área: ${area?.nome || '-'} |
        Rua: ${rua?.nome || '-'} |
        RZ: ${pos?.rz || '-'} |
        Volume: ${pos?.volume || '-'}
      `;

      lista.appendChild(label);
    });

    modal.classList.remove('hidden');

  } catch (err) {
    console.error("Erro abrir modal expedição:", err);
  }
};

// =====================================================
// CONFIRMAR EXPEDIÇÃO
// =====================================================
window.confirmarExpedicao = async function () {

  if (expedicaoContext.processando) return;
  expedicaoContext.processando = true;

  try {

    const checks = document.querySelectorAll(
      '#listaExpedicao input[type="checkbox"]:checked'
    );

    if (!checks || checks.length === 0) {
      alert('Selecione ao menos uma gaylord.');
      expedicaoContext.processando = false;
      return;
    }

    if (!confirm(`Confirmar expedição de ${checks.length} gaylord(s)?`)) {
      expedicaoContext.processando = false;
      return;
    }

    const lotesAfetados = new Set();

    for (const chk of checks) {

      const posId = chk?.dataset?.posid;
      if (!posId) continue;

      // 🔥 BUSCA POSIÇÃO ATUAL NO BANCO
      const { data: posBanco, error } = await supabase
        .from('posicoes')
        .select('*')
        .eq('id', posId)
        .single();

      if (error || !posBanco || posBanco.ocupada !== true) {
        console.warn('Posição inválida ou já liberada:', posId);
        continue;
      }

      const loteId = posBanco.lote_id;
      lotesAfetados.add(loteId);

      const volumeOriginal = posBanco.volume;

      // 🔥 LIBERA POSIÇÃO
      const { error: erroUpdate } = await supabase
        .from('posicoes')
        .update({
          ocupada: false,
          volume: null
        })
        .eq('id', posId);

      if (erroUpdate) {
        console.error("Erro liberar posição:", erroUpdate);
        continue;
      }

      // 🔥 INSERE HISTÓRICO
      const { error: erroInsert } = await supabase
        .from('historico_expedidos')
        .insert([{
          lote_id: loteId,
          posicao_id: posBanco.id,
          posicao: posBanco.rz,
          volume: volumeOriginal,
          data_expedicao: new Date().toISOString(),
          status: 'EXPEDIDO'
        }]);

      if (erroInsert) {
        console.error("Erro histórico:", erroInsert);
      }

    }

    // 🔥 ATUALIZA STATUS DOS LOTES
    for (const loteId of lotesAfetados) {
      await atualizarStatusLote(loteId);
    }

    fecharModalExpedicao();

    // 🔥 RECARREGA SISTEMA
    if (typeof carregarSistema === 'function') {
      await carregarSistema();
    }

  } catch (err) {
    console.error("Erro confirmarExpedicao:", err);
  }

  expedicaoContext.processando = false;
};

// =====================================================
// ATUALIZAR STATUS DO LOTE (BLINDADO)
// =====================================================
async function atualizarStatusLote(loteId) {

  try {

    const { data: posicoes, error } = await supabase
      .from('posicoes')
      .select('id, ocupada')
      .eq('lote_id', loteId);

    if (error) {
      console.error("Erro buscar posições:", error);
      return;
    }

    if (!posicoes || posicoes.length === 0) {
      await supabase
        .from('lotes')
        .update({ status: 'EXPEDIDO' })
        .eq('id', loteId);
      return;
    }

    const total = posicoes.length;
    const ocupadas = posicoes.filter(p => p?.ocupada === true).length;

    let novoStatus = 'ATIVO';

    if (ocupadas === 0) {
      novoStatus = 'EXPEDIDO';
    }
    else if (ocupadas < total) {
      novoStatus = 'PARCIAL';
    }

    const { error: erroUpdate } = await supabase
      .from('lotes')
      .update({ status: novoStatus })
      .eq('id', loteId);

    if (erroUpdate) {
      console.error("Erro atualizar status lote:", erroUpdate);
    }

  } catch (err) {
    console.error("Erro atualizarStatusLote:", err);
  }
}

// =====================================================
// FECHAR MODAL
// =====================================================
window.fecharModalExpedicao = function () {

  const modal = document.getElementById('modalExpedicao');
  if (modal) modal.classList.add('hidden');
};
