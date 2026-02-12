/* // ===============================
// EXPEDICAO.JS — CONTROLE DE EXPEDIÇÃO (REVISADO)
// ===============================

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  const selecionaveis = [];

  state.areas.forEach((area, ai) => {
    area.ruas.forEach((rua, ri) => {
      rua.posicoes.forEach((pos, pi) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          selecionaveis.push({ ai, ri, pi, pos });
        }
      });
    });
  });

  if (selecionaveis.length === 0) {
    alert('Nenhuma gaylord alocada neste lote.');
    return;
  }

  selecionaveis.forEach(({ ai, ri, pi, pos }) => {
    lista.innerHTML += `
      <label class="linha-expedicao">
        <input
          type="checkbox"
          data-ai="${ai}"
          data-ri="${ri}"
          data-pi="${pi}"
          checked
        />
        Área: ${state.areas[ai].nome} |
        Rua: ${state.areas[ai].ruas[ri].nome} |
        RZ: ${pos.rz} |
        Volume: ${pos.volume || '-'}
      </label>
    `;
  });

  document
    .getElementById('modalExpedicao')
    .classList.remove('hidden');
};

// -------------------------------
// SELECIONAR / DESMARCAR
// -------------------------------
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

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
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

  const detalhes = [];
  let loteNome = null;

  checks.forEach(chk => {
    const ai = Number(chk.dataset.ai);
    const ri = Number(chk.dataset.ri);
    const pi = Number(chk.dataset.pi);

    const pos = state.areas[ai].ruas[ri].posicoes[pi];
    if (!pos || !pos.ocupada) return;

    loteNome = pos.lote;

    detalhes.push({
      rz: pos.rz,
      volume: pos.volume
    });

    // 🔥 LIBERA POSIÇÃO
    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;
  });

  if (!loteNome) {
    alert('Erro ao identificar lote');
    return;
  }

  state.historicoExpedidos.push({
    lote: loteNome,
    data: new Date().toLocaleString('pt-BR'),
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
  document
    .getElementById('modalExpedicao')
    .classList.add('hidden');
};

*/

// ===============================
// EXPEDICAO.JS — CONTROLE DE EXPEDIÇÃO
// ===============================


// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  const selecionaveis = [];

  state.areas.forEach((area, ai) => {
    area.ruas.forEach((rua, ri) => {
      rua.posicoes.forEach((pos, pi) => {

        if (pos.ocupada && pos.lote === nomeLote) {
          selecionaveis.push({ ai, ri, pi, pos });
        }

      });
    });
  });

  if (selecionaveis.length === 0) {
    alert('Nenhuma gaylord alocada neste lote.');
    return;
  }

  selecionaveis.forEach(({ ai, ri, pi, pos }) => {

    lista.innerHTML += `
      <label class="linha-expedicao">
        <input
          type="checkbox"
          data-ai="${ai}"
          data-ri="${ri}"
          data-pi="${pi}"
          checked
        />
        Área: ${state.areas[ai].nome} |
        Rua: ${state.areas[ai].ruas[ri].nome} |
        RZ: ${pos.rz} |
        Volume: ${pos.volume || '-'}
      </label>
    `;
  });

  document
    .getElementById('modalExpedicao')
    .classList.remove('hidden');
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
// CONFIRMAR EXPEDIÇÃO (PADRÃO FINAL)
// -------------------------------
window.confirmarExpedicao = function () {

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

  checks.forEach(chk => {

    const ai = Number(chk.dataset.ai);
    const ri = Number(chk.dataset.ri);
    const pi = Number(chk.dataset.pi);

    const pos = state.areas[ai].ruas[ri].posicoes[pi];

    if (!pos || !pos.ocupada) return;

    const agora = new Date();

    // 🔥 SALVA CADA REGISTRO INDIVIDUALMENTE
    state.historicoExpedidos.push({
      nome: pos.lote,                               // PADRÃO
      rz: pos.rz,
      volume: pos.volume,
      status: 'EXPEDIDO',
      area: state.areas[ai].nome,
      rua: state.areas[ai].ruas[ri].nome,
      data: agora.toLocaleDateString('pt-BR'),
      hora: agora.toLocaleTimeString('pt-BR')
    });

    // 🔥 LIBERA POSIÇÃO NO MAPA
    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;

  });

  // 🔥 SALVA NO LOCALSTORAGE
  saveState();

  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
};


// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {

  document
    .getElementById('modalExpedicao')
    .classList.add('hidden');

};
