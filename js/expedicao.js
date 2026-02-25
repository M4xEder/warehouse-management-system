// =====================================================
// EXPEDICAO.JS — VERSÃO PROFISSIONAL BLINDADA
// =====================================================



// =====================================================
// ABRIR MODAL DE EXPEDIÇÃO
// =====================================================
window.expedirLote = function (loteId) {

  const lista = document.getElementById('listaExpedicao');
  if (!lista) return;

  lista.innerHTML = '';

  const lote = state.lotes.find(l => l.id === loteId);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  const selecionaveis = (state.posicoes || []).filter(p =>
    p.ocupada === true &&
    p.lote_id === lote.id
  );

  if (selecionaveis.length === 0) {
    alert('Nenhuma gaylord alocada neste lote.');
    return;
  }

  selecionaveis.forEach(pos => {

    const rua = state.ruas.find(r => r.id === pos.rua_id);
    const area = state.areas.find(a => a.id === rua?.area_id);

    lista.innerHTML += `
      <label class="linha-expedicao">
        <input
          type="checkbox"
          data-posid="${pos.id}"
          checked
        />
        Área: ${area?.nome || '-'} |
        Rua: ${rua?.nome || '-'} |
        RZ: ${pos.rz || '-'} |
        Volume: ${pos.volume || '-'}
      </label>
    `;
  });

  document
    .getElementById('modalExpedicao')
    ?.classList.remove('hidden');
};



// =====================================================
// SELECIONAR / DESMARCAR TODOS
// =====================================================
window.selecionarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(c => c.checked = true);
};

window.desmarcarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(c => c.checked = false);
};



// =====================================================
// CONFIRMAR EXPEDIÇÃO — BLINDADO
// =====================================================
window.confirmarExpedicao = async function () {

  const checks = document.querySelectorAll(
    '#listaExpedicao input[type="checkbox"]:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord.');
    return;
  }

  if (!confirm(`Confirmar expedição de ${checks.length} gaylord(s)?`)) {
    return;
  }

  const lotesAfetados = new Set();

  for (const chk of checks) {

    const posId = chk.dataset.posid;

    // 🔎 Busca posição direto do banco (blindagem)
    const { data: posBanco, error: erroBusca } = await supabase
      .from('posicoes')
      .select('*')
      .eq('id', posId)
      .single();

    if (erroBusca || !posBanco || posBanco.ocupada !== true) {
      console.warn('Posição inválida ou já liberada:', posId);
      continue;
    }

    const loteId = posBanco.lote_id;
    lotesAfetados.add(loteId);

    // =================================================
    // 1️⃣ LIBERA POSIÇÃO
    // =================================================
    const { error: erroLiberar } = await supabase
      .from('posicoes')
      .update({
        ocupada: false,
        lote_id: null,
        volume: null
      })
      .eq('id', posId);

    if (erroLiberar) {
      console.error('Erro ao liberar posição:', erroLiberar);
      continue;
    }

    // =================================================
    // 2️⃣ REGISTRA HISTÓRICO
    // =================================================
    await supabase
      .from('historico_expedidos')
      .insert([{
        lote_id: loteId,
        posicao_id: posBanco.id,
        lote: posBanco.lote_nome || null,
        area: posBanco.area_nome || null,
        rua: posBanco.rua_nome || null,
        posicao: posBanco.rz,
        volume: posBanco.volume,
        data_expedicao: new Date().toISOString()
      }]);

  }

  // =====================================================
  // 3️⃣ ATUALIZA STATUS DOS LOTES AFETADOS
  // =====================================================
  for (const loteId of lotesAfetados) {
    await atualizarStatusLote(loteId);
  }

  fecharModalExpedicao();

  // =====================================================
  // 🔄 RECARREGA SISTEMA COMPLETO
  // =====================================================
  if (typeof carregarDadosIniciais === 'function') {
    await carregarDadosIniciais();
  }

  if (typeof renderMapa === 'function') {
    renderMapa();
  }

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }

};



// =====================================================
// ATUALIZA STATUS DO LOTE (ATIVO / PARCIAL / EXPEDIDO)
// =====================================================
async function atualizarStatusLote(loteId) {

  const { data: todas } = await supabase
    .from('posicoes')
    .select('id')
    .eq('lote_id', loteId);

  const total = todas.length;

  const { data: ocupadas } = await supabase
    .from('posicoes')
    .select('id')
    .eq('lote_id', loteId)
    .eq('ocupada', true);

  const restantes = ocupadas.length;

  let novoStatus = 'ATIVO';

  if (total > 0 && restantes === 0) {
    novoStatus = 'EXPEDIDO';
  }
  else if (restantes < total) {
    novoStatus = 'PARCIAL';
  }

  await supabase
    .from('lotes')
    .update({ status: novoStatus })
    .eq('id', loteId);

}



// =====================================================
// FECHAR MODAL
// =====================================================
window.fecharModalExpedicao = function () {

  document
    .getElementById('modalExpedicao')
    ?.classList.add('hidden');

};
