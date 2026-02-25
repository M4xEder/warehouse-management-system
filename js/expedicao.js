// =====================================================
// EXPEDICAO.JS — VERSÃO PROFISSIONAL FINAL
// =====================================================



// =====================================================
// ABRIR MODAL
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

  const selecionaveis = state.posicoes.filter(p =>
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
// CONFIRMAR EXPEDIÇÃO
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

    const { data: posBanco, error } = await supabase
      .from('posicoes')
      .select('*')
      .eq('id', posId)
      .single();

    if (error || !posBanco || !posBanco.ocupada) {
      console.warn('Posição inválida:', posId);
      continue;
    }

    const loteId = posBanco.lote_id;
    lotesAfetados.add(loteId);

    // 🔥 LIBERA POSIÇÃO (MAS MANTÉM lote_id)
    await supabase
      .from('posicoes')
      .update({
        ocupada: false,
        volume: null
      })
      .eq('id', posId);

    // 🔥 HISTÓRICO
    await supabase
      .from('historico_expedidos')
      .insert([{
        lote_id: loteId,
        posicao_id: posBanco.id,
        posicao: posBanco.rz,
        volume: posBanco.volume,
        data_expedicao: new Date().toISOString()
      }]);
  }

  // 🔥 ATUALIZA STATUS
  for (const loteId of lotesAfetados) {
    await atualizarStatusLote(loteId);
  }

  fecharModalExpedicao();

  // 🔥 RECARREGA SISTEMA CORRETAMENTE
  if (typeof carregarSistema === 'function') {
    await carregarSistema();
  }
};



// =====================================================
// ATUALIZAR STATUS DO LOTE
// =====================================================
async function atualizarStatusLote(loteId) {

  const { data: posicoes } = await supabase
    .from('posicoes')
    .select('id, ocupada')
    .eq('lote_id', loteId);

  if (!posicoes || posicoes.length === 0) {
    await supabase
      .from('lotes')
      .update({ status: 'EXPEDIDO' })
      .eq('id', loteId);
    return;
  }

  const total = posicoes.length;
  const ocupadas = posicoes.filter(p => p.ocupada).length;

  let novoStatus = 'ATIVO';

  if (ocupadas === 0) {
    novoStatus = 'EXPEDIDO';
  }
  else if (ocupadas < total) {
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
