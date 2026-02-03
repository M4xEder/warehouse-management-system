// =======================================
// EXPEDICAO.JS
// Expedição TOTAL ou PARCIAL com seleção
// =======================================

let expedicaoContext = {
  lote: null,
  itens: []
};

// -------------------------------
// LISTAR GAYLORDS DO LOTE
// -------------------------------
function listarGaylordsDoLote(nomeLote) {
  const lista = [];

  state.areas.forEach((area, areaIndex) => {
    area.ruas.forEach((rua, ruaIndex) => {
      rua.posicoes.forEach((pos, posicaoIndex) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          lista.push({
            areaIndex,
            ruaIndex,
            posicaoIndex,
            area: area.nome,
            rua: rua.nome,
            posicao: posicaoIndex + 1,
            rz: pos.rz,
            volume: pos.volume || '-'
          });
        }
      });
    });
  });

  return lista;
}

// -------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// -------------------------------
window.expedirLote = function (nomeLote) {
  const itens = listarGaylordsDoLote(nomeLote);

  if (itens.length === 0) {
    alert('Nenhuma gaylord encontrada para este lote');
    return;
  }

  expedicaoContext.lote = nomeLote;
  expedicaoContext.itens = itens;

  renderModalExpedicao();
};

// -------------------------------
// RENDER MODAL EXPEDIÇÃO
// -------------------------------
function renderModalExpedicao() {
  let modal = document.getElementById('modalExpedicao');

  // Cria modal se não existir
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalExpedicao';
    modal.className = 'modal';

    modal.innerHTML = `
      <div class="modal-content" style="max-width:800px">
        <h3>Expedição - Selecionar Gaylords</h3>

        <table class="tabela-expedicao">
          <thead>
            <tr>
              <th></th>
              <th>Área</th>
              <th>Rua</th>
              <th>Posição</th>
              <th>RZ</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody id="expedicaoLista"></tbody>
        </table>

        <div class="acoes">
          <button onclick="confirmarExpedicao()">Confirmar Expedição</button>
          <button onclick="fecharModalExpedicao()">Cancelar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  const tbody = document.getElementById('expedicaoLista');
  tbody.innerHTML = '';

  expedicaoContext.itens.forEach((item, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <input type="checkbox" data-index="${index}">
      </td>
      <td>${item.area}</td>
      <td>${item.rua}</td>
      <td>${item.posicao}</td>
      <td>${item.rz}</td>
      <td>${item.volume}</td>
    `;

    tbody.appendChild(tr);
  });

  modal.classList.remove('hidden');
}

// -------------------------------
// FECHAR MODAL
// -------------------------------
function fecharModalExpedicao() {
  const modal = document.getElementById('modalExpedicao');
  if (modal) modal.classList.add('hidden');

  expedicaoContext = {
    lote: null,
    itens: []
  };
}

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
function confirmarExpedicao() {
  const checks = document.querySelectorAll(
    '#expedicaoLista input[type="checkbox"]:checked'
  );

  if (checks.length === 0) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const selecionadas = [];

  checks.forEach(check => {
    const idx = Number(check.dataset.index);
    selecionadas.push(expedicaoContext.itens[idx]);
  });

  // Remove somente as selecionadas
  selecionadas.forEach(item => {
    const pos =
      state.areas[item.areaIndex]
        .ruas[item.ruaIndex]
        .posicoes[item.posicaoIndex];

    pos.ocupada = false;
    pos.lote = null;
    pos.rz = null;
    pos.volume = null;
  });

  // Histórico
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: expedicaoContext.lote,
    tipo: selecionadas.length === expedicaoContext.itens.length
      ? 'TOTAL'
      : 'PARCIAL',
    quantidade: selecionadas.length,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes: selecionadas
  });

  // Remove lote somente se não sobrar nenhuma
  const restantes = listarGaylordsDoLote(expedicaoContext.lote);
  if (restantes.length === 0) {
    state.lotes = state.lotes.filter(
      l => l.nome !== expedicaoContext.lote
    );
  }

  saveState();
  fecharModalExpedicao();

  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert('Expedição realizada com sucesso');
}
