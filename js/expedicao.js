// =======================================
// EXPEDICAO.JS
// Expedição total ou parcial de lotes
// =======================================

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const modal = document.getElementById('modalExpedicao');
  const lista = document.getElementById('listaExpedicao');

  if (!modal || !lista) {
    alert('Modal de expedição não encontrado');
    return;
  }

  lista.innerHTML = '';

  let encontrou = false;

  state.areas.forEach((area, areaIndex) => {
    area.ruas.forEach((rua, ruaIndex) => {
      rua.posicoes.forEach((pos, posicaoIndex) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          encontrou = true;

          const item = document.createElement('div');
          item.className = 'expedicao-item';

          item.innerHTML = `
            <label>
              <input
                type="checkbox"
                class="expedicao-checkbox"
                data-area="${areaIndex}"
                data-rua="${ruaIndex}"
                data-posicao="${posicaoIndex}"
                checked
              />
              Área: <strong>${area.nome}</strong> |
              Rua: <strong>${rua.nome}</strong> |
              Posição: <strong>${posicaoIndex + 1}</strong> |
              RZ: <strong>${pos.rz}</strong> |
              Volume: <strong>${pos.volume || '-'}</strong>
            </label>
          `;

          lista.appendChild(item);
        }
      });
    });
  });

  if (!encontrou) {
    alert('Nenhuma gaylord encontrada para este lote');
    return;
  }

  modal.dataset.lote = nomeLote;
  modal.classList.remove('hidden');
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  const modal = document.getElementById('modalExpedicao');
  const nomeLote = modal.dataset.lote;

  if (!nomeLote) return;

  const checks = document.querySelectorAll(
    '.expedicao-checkbox:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const detalhes = [];

  checks.forEach(cb => {
    const areaIndex = Number(cb.dataset.area);
    const ruaIndex = Number(cb.dataset.rua);
    const posicaoIndex = Number(cb.dataset.posicao);

    const pos =
      state.areas[areaIndex]
        .ruas[ruaIndex]
        .posicoes[posicaoIndex];

    detalhes.push({
      area: state.areas[areaIndex].nome,
      rua: state.areas[areaIndex].ruas[ruaIndex].nome,
      posicao: posicaoIndex + 1,
      rz: pos.rz,
      volume: pos.volume || '-'
    });

    // limpa posição
    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;
  });

  // Verifica se foi total ou parcial
  const restantes = contarGaylordsDoLote(nomeLote);
  const tipo = restantes === 0 ? 'TOTAL' : 'PARCIAL';

  // Histórico
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    tipo,
    quantidade: detalhes.length,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  // Se foi total, remove o lote
  if (restantes === 0) {
    state.lotes = state.lotes.filter(l => l.nome !== nomeLote);
  }

  saveState();

  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
  if (typeof renderExpedidos === 'function') {
    renderExpedidos();
  }

  alert(
    `Expedição ${tipo} realizada\n` +
    `Quantidade: ${detalhes.length}`
  );
};

// -------------------------------
// FECHAR MODAL
// -------------------------------
window.fecharModalExpedicao = function () {
  const modal = document.getElementById('modalExpedicao');
  modal.classList.add('hidden');
  modal.dataset.lote = '';
};

// -------------------------------
// SELECIONAR / DESMARCAR TODOS
// -------------------------------
window.selecionarTodosGaylords = function () {
  document
    .querySelectorAll('.expedicao-checkbox')
    .forEach(cb => (cb.checked = true));
};

window.desmarcarTodosGaylords = function () {
  document
    .querySelectorAll('.expedicao-checkbox')
    .forEach(cb => (cb.checked = false));
};
