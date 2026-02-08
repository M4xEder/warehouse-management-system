// ===============================
// EXPEDICAO.JS — CONTROLE DE EXPEDIÇÃO
// ===============================

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
        <input type="checkbox"
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

  document.getElementById('modalExpedicao').classList.remove('hidden');
};

window.selecionarTodosGaylords = function () {
  document.querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(c => c.checked = true);
};

window.desmarcarTodosGaylords = function () {
  document.querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(c => c.checked = false);
};

window.confirmarExpedicao = function () {
  const checks = document.querySelectorAll(
    '#listaExpedicao input[type="checkbox"]:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const detalhes = [];
  let loteNome = null;

  checks.forEach(chk => {
    const ai = Number(chk.dataset.ai);
    const ri = Number(chk.dataset.ri);
    const pi = Number(chk.dataset.pi);

    const pos = state.areas[ai].ruas[ri].posicoes[pi];
    loteNome = pos.lote;

    detalhes.push({
      rz: pos.rz,
      volume: pos.volume
    });

    // 🔥 LIBERA POSIÇÃO — NÃO APAGA
    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;
  });

  state.historicoExpedidos.push({
    lote: loteNome,
    data: new Date().toLocaleDateString('pt-BR'),
    detalhes
  });

  saveState();
  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
};

window.fecharModalExpedicao = function () {
  document.getElementById('modalExpedicao').classList.add('hidden');
};
