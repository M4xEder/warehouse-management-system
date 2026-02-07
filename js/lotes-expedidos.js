// =======================================
// LOTES-EXPEDIDOS.JS
// =======================================

// Estrutura esperada em state.historicoExpedidos:
/*
state.historicoExpedidos = [
  {
    lote: 'Lote A',
    quantidadeExpedida: 3,
    data: '2026-02-01T14:22:00',
    gaylords: [
      { rz: 'RZ001', volume: '10m³' },
      { rz: 'RZ002', volume: '9m³' }
    ]
  }
]
*/

// ===============================
// AGRUPAR EXPEDIÇÕES POR LOTE
// ===============================
function agruparExpedidosPorLote() {
  const mapa = {};

  state.historicoExpedidos.forEach(reg => {
    if (!mapa[reg.lote]) {
      mapa[reg.lote] = {
        lote: reg.lote,
        totalExpedido: 0,
        expedicoes: [],
        gaylords: []
      };
    }

    mapa[reg.lote].totalExpedido += reg.quantidadeExpedida;
    mapa[reg.lote].expedicoes.push(reg);
    mapa[reg.lote].gaylords.push(...(reg.gaylords || []));
  });

  return Object.values(mapa);
}

// ===============================
// RENDER LOTES EXPEDIDOS
// ===============================
window.renderLotesExpedidos = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (!state.historicoExpedidos || state.historicoExpedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido</p>';
    return;
  }

  const agrupados = agruparExpedidosPorLote();

  agrupados.forEach(grupo => {
    const loteAtivo = state.lotes.find(l => l.nome === grupo.lote);
    const totalLote = loteAtivo ? loteAtivo.total : grupo.totalExpedido;

    const tipo =
      grupo.totalExpedido >= totalLote
        ? 'Lote expedido TOTAL'
        : 'Lote expedido PARCIAL';

    const ultimaExpedicao =
      grupo.expedicoes[grupo.expedicoes.length - 1];

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>Lote: ${grupo.lote}</strong>

      <div style="font-size:13px; margin-top:6px;">
        <div>Total do lote: <strong>${totalLote}</strong></div>
        <div>Expedidos: <strong>${grupo.totalExpedido}</strong></div>
        <div>Última expedição: <strong>${formatarData(ultimaExpedicao.data)}</strong></div>
        <div>Status: <strong>${tipo}</strong></div>
      </div>

      <div style="margin-top:8px">
        <button onclick="detalhesLoteExpedido('${grupo.lote}')">
          Detalhes
        </button>
        <button class="danger"
                onclick="excluirLoteExpedido('${grupo.lote}')">
          Excluir
        </button>
      </div>
    `;

    container.appendChild(card);
  });
};

// ===============================
// DETALHES DO LOTE EXPEDIDO
// ===============================
window.detalhesLoteExpedido = function (nomeLote) {
  const grupo = agruparExpedidosPorLote()
    .find(g => g.lote === nomeLote);

  if (!grupo) return;

  let html = `
    <h3>Lote ${grupo.lote}</h3>
    <p>Expedido <strong>${grupo.expedicoes.length}</strong> vezes</p>
  `;

  if (grupo.expedicoes.length > 1) {
    html += `
      <p>
        Lote foi expedido ${grupo.expedicoes.length} vezes antes da última expedição.
      </p>
    `;
  }

  html += `<hr><strong>Gaylords expedidas:</strong><ul>`;

  grupo.gaylords.forEach(g => {
    html += `<li>RZ: ${g.rz || '-'} | Volume: ${g.volume || '-'}</li>`;
  });

  html += '</ul><hr><strong>Histórico de expedições:</strong><ul>';

  grupo.expedicoes.forEach(e => {
    html += `
      <li>
        ${formatarData(e.data)} — ${e.quantidadeExpedida} gaylords
      </li>
    `;
  });

  html += '</ul>';

  abrirModalGenerico(html);
};

// ===============================
// EXCLUIR LOTE EXPEDIDO
// ===============================
window.excluirLoteExpedido = function (nomeLote) {
  if (!confirm(`Excluir histórico do lote "${nomeLote}"?`)) return;

  state.historicoExpedidos = state.historicoExpedidos
    .filter(e => e.lote !== nomeLote);

  saveState();
  renderLotesExpedidos();
};

// ===============================
// UTIL — DATA
// ===============================
function formatarData(dataISO) {
  const d = new Date(dataISO);
  return d.toLocaleDateString('pt-BR') +
         ' ' +
         d.toLocaleTimeString('pt-BR');
}

// ===============================
// MODAL SIMPLES (REUTILIZÁVEL)
// ===============================
function abrirModalGenerico(html) {
  let modal = document.getElementById('modalGenerico');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modalGenerico';
    modal.className = 'modal';

    modal.innerHTML = `
      <div class="modal-content">
        <button onclick="fecharModalGenerico()">Fechar</button>
        <div id="modalGenericoConteudo"></div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  document.getElementById('modalGenericoConteudo').innerHTML = html;
  modal.classList.remove('hidden');
}

window.fecharModalGenerico = function () {
  document.getElementById('modalGenerico')
    .classList.add('hidden');
};
