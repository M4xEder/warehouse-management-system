// ===============================
// EXPEDICAO.JS — CONTROLE DE EXPEDIÇÃO
// ===============================

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return;

  const gaylords = [];

  // Percorre mapa buscando gaylords alocadas do lote
  Object.values(state.areas).forEach(area => {
    Object.values(area.ruas).forEach(rua => {
      Object.values(rua.posicoes).forEach(pos => {
        if (pos.lote === nomeLote) {
          gaylords.push({
            area: area.nome,
            rua: rua.nome,
            posicao: pos.id,
            rz: pos.rz,
            volume: pos.volume
          });
        }
      });
    });
  });

  if (gaylords.length === 0) {
    alert('Não há gaylords alocadas para este lote.');
    return;
  }

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  gaylords.forEach((g, i) => {
    lista.innerHTML += `
      <label class="linha-expedicao">
        <input
          type="checkbox"
          class="chk-expedicao"
          data-area="${g.area}"
          data-rua="${g.rua}"
          data-posicao="${g.posicao}"
          data-rz="${g.rz}"
          data-volume="${g.volume}"
          checked
        />
        Área: ${g.area} | Rua: ${g.rua} | 
        RZ: ${g.rz} | Volume: ${g.volume}
      </label>
    `;
  });

  document.getElementById('modalExpedicao').classList.remove('hidden');
};

// -------------------------------
// SELECIONAR TODOS
// -------------------------------
window.selecionarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao .chk-expedicao')
    .forEach(chk => chk.checked = true);
};

// -------------------------------
// DESMARCAR TODOS
// -------------------------------
window.desmarcarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao .chk-expedicao')
    .forEach(chk => chk.checked = false);
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  const checks = document.querySelectorAll(
    '#listaExpedicao .chk-expedicao:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord para expedir.');
    return;
  }

  const data = new Date().toLocaleString('pt-BR');
  const detalhes = [];
  let nomeLote = null;

  checks.forEach(chk => {
    const area = chk.dataset.area;
    const rua = chk.dataset.rua;
    const posicao = chk.dataset.posicao;
    const rz = chk.dataset.rz;
    const volume = chk.dataset.volume;

    const pos =
      state.areas[area].ruas[rua].posicoes[posicao];

    nomeLote = pos.lote;

    detalhes.push({
      rz,
      volume
    });

    // Remove do mapa
    delete state.areas[area].ruas[rua].posicoes[posicao];
  });

  // Registra histórico
  state.historicoExpedidos.push({
    lote: nomeLote,
    data,
    detalhes
  });

  // Atualiza lote
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (lote) {
    lote.expedidos += detalhes.length;

    // Se expediu tudo, desativa
    if (lote.expedidos >= lote.total) {
      lote.ativo = false;
    }
  }

  saveState();

  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {
  document.getElementById('modalExpedicao').classList.add('hidden');
};
