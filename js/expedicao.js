// ===============================
// EXPEDICAO.JS — CONTROLE DE EXPEDIÇÃO
// ===============================

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  const gaylords = [];

  // Busca gaylords alocadas no mapa
  Object.values(state.areas).forEach(area => {
    Object.values(area.ruas).forEach(rua => {
      Object.entries(rua.posicoes).forEach(([id, pos]) => {
        if (pos.lote === nomeLote) {
          gaylords.push({
            area: area.nome,
            rua: rua.nome,
            posicao: id,
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

  gaylords.forEach(g => {
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
    .forEach(c => c.checked = true);
};

// -------------------------------
// DESMARCAR TODOS
// -------------------------------
window.desmarcarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao .chk-expedicao')
    .forEach(c => c.checked = false);
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  const checks = document.querySelectorAll(
    '#listaExpedicao .chk-expedicao:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord.');
    return;
  }

  const data = new Date().toLocaleString('pt-BR');
  const detalhes = [];
  let loteNome = null;

  checks.forEach(chk => {
    const area = chk.dataset.area;
    const rua = chk.dataset.rua;
    const posicao = chk.dataset.posicao;

    const pos =
      state.areas[area].ruas[rua].posicoes[posicao];

    loteNome = pos.lote;

    detalhes.push({
      rz: pos.rz,
      volume: pos.volume
    });

    // Remove do mapa
    delete state.areas[area].ruas[rua].posicoes[posicao];
  });

  // Salva histórico (única fonte de expedição)
  state.historicoExpedidos.push({
    lote: loteNome,
    data,
    detalhes
  });

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
