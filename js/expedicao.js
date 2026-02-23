// ===============================
// EXPEDICAO.JS — PADRÃO SUPABASE PROFISSIONAL (ID BASED)
// ===============================



// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (loteId) {

  const lista = document.getElementById('listaExpedicao');
  if (!lista) return;

  lista.innerHTML = '';

  const lote = state.lotes.find(l => l.id === loteId);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  // 🔥 Busca posições ocupadas desse lote
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



// -------------------------------
// SELECIONAR TODOS
// -------------------------------
window.selecionarTodosGaylords = function () {

  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(c => c.checked = true);

};



// -------------------------------
// DESMARCAR TODOS
// -------------------------------
window.desmarcarTodosGaylords = function () {

  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(c => c.checked = false);

};



// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = async function () {

  const checks = document.querySelectorAll(
    '#listaExpedicao input[type="checkbox"]:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  if (!confirm(`Confirmar expedição de ${checks.length} gaylord(s)?`)) {
    return;
  }

  for (const chk of checks) {

    const posId = chk.dataset.posid;

    const pos = state.posicoes.find(p => p.id == posId);
    if (!pos || !pos.ocupada) continue;

    const lote = state.lotes.find(l => l.id === pos.lote_id);
    if (!lote) continue;

    const rua = state.ruas.find(r => r.id === pos.rua_id);
    const area = state.areas.find(a => a.id === rua?.area_id);

    const agora = new Date();

    // 🔥 REGISTRA HISTÓRICO (SEMPRE COM lote_id)
    const { error: erroHist } = await dbRegistrarExpedicao({
      lote_id: lote.id,
      nome: lote.nome, // opcional para exibição
      rz: pos.rz,
      volume: pos.volume,
      status: 'EXPEDIDO',
      area: area?.nome || null,
      rua: rua?.nome || null,
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR')
    });

    if (erroHist) {
      console.error('Erro ao registrar histórico:', erroHist);
      continue;
    }

    // 🔥 LIBERA POSIÇÃO (NÃO ALTERA QUANTIDADE DO LOTE)
    const { error: erroLiberar } = await dbLiberarPosicao(pos.id);

    if (erroLiberar) {
      console.error('Erro ao liberar posição:', erroLiberar);
    }

  }

  fecharModalExpedicao();

  // 🔄 Recarrega dados para manter sincronizado
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



// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {

  document
    .getElementById('modalExpedicao')
    ?.classList.add('hidden');

};
