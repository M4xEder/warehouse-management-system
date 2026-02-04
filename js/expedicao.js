// =======================================
// EXPEDICAO.JS
// Expedição parcial e total com histórico
// =======================================

let gaylordsSelecionados = [];
let loteAtualExpedicao = null;

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.abrirModalExpedicao = function (nomeLote) {
  loteAtualExpedicao = nomeLote;
  gaylordsSelecionados = [];

  const lista = document.getElementById('listaExpedicao');
  lista.innerHTML = '';

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          const id = `${area.nome}-${rua.nome}-${index}`;

          const div = document.createElement('div');
          div.innerHTML = `
            <label>
              <input type="checkbox"
                data-id="${id}"
                data-area="${area.nome}"
                data-rua="${rua.nome}"
                data-index="${index}">
              Área: ${area.nome} |
              Rua: ${rua.nome} |
              Posição: ${index + 1} |
              RZ: ${pos.rz || '-'} |
              Volume: ${pos.volume || '-'}
            </label>
          `;

          lista.appendChild(div);
        }
      });
    });
  });

  document.getElementById('modalExpedicao').classList.remove('hidden');
};

// -------------------------------
// SELEÇÃO
// -------------------------------
window.selecionarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(cb => cb.checked = true);
};

window.desmarcarTodosGaylords = function () {
  document
    .querySelectorAll('#listaExpedicao input[type="checkbox"]')
    .forEach(cb => cb.checked = false);
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  const checkboxes =
    document.querySelectorAll('#listaExpedicao input:checked');

  if (checkboxes.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const detalhes = [];

  checkboxes.forEach(cb => {
    const area = state.areas.find(a => a.nome === cb.dataset.area);
    const rua = area.ruas.find(r => r.nome === cb.dataset.rua);
    const pos = rua.posicoes[cb.dataset.index];

    detalhes.push({
      area: area.nome,
      rua: rua.nome,
      posicao: Number(cb.dataset.index) + 1,
      rz: pos.rz,
      volume: pos.volume
    });

    // LIMPA A POSIÇÃO
    pos.ocupada = false;
    pos.lote = '';
    pos.rz = '';
    pos.volume = '';
  });

  const quantidadeExpedida = detalhes.length;

  const totalDoLote =
    state.lotes.find(l => l.nome === loteAtualExpedicao)?.total || 0;

  const totalJaExpedido = state.historicoExpedidos
    .filter(e => e.lote === loteAtualExpedicao)
    .reduce((acc, e) => acc + e.quantidadeExpedida, 0);

  const novoTotal = totalJaExpedido + quantidadeExpedida;

  if (novoTotal > totalDoLote) {
    alert('Quantidade expedida excede o total do lote');
    return;
  }

  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: loteAtualExpedicao,
    tipo: novoTotal === totalDoLote ? 'TOTAL' : 'PARCIAL',
    quantidadeExpedida,
    quantidadeTotal: totalDoLote,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  // REMOVE O LOTE SOMENTE SE COMPLETO
  if (novoTotal === totalDoLote) {
    state.lotes = state.lotes.filter(l => l.nome !== loteAtualExpedicao);
  }

  saveState();

  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert(`Expedição registrada com sucesso (${quantidadeExpedida})`);
};

// -------------------------------
window.fecharModalExpedicao = function () {
  document.getElementById('modalExpedicao').classList.add('hidden');
};
