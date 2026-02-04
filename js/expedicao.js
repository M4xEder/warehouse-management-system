// =======================================
// EXPEDICAO.JS
// =======================================

let contextoExpedicao = {
  lote: null,
  selecionados: []
};

// -------------------------------
// ABRIR MODAL
// -------------------------------
window.abrirModalExpedicao = function (nomeLote) {
  const modal = document.getElementById('modalExpedicao');
  const lista = document.getElementById('listaExpedicao');

  contextoExpedicao.lote = nomeLote;
  contextoExpedicao.selecionados = [];

  lista.innerHTML = '';

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (pos.ocupada && pos.lote === nomeLote) {
          const id = crypto.randomUUID();

          lista.innerHTML += `
            <label style="display:block; margin-bottom:4px">
              <input type="checkbox"
                     data-area="${area.nome}"
                     data-rua="${rua.nome}"
                     data-posicao="${index + 1}"
                     data-rz="${pos.rz || ''}"
                     data-volume="${pos.volume || ''}">
              Área ${area.nome} | Rua ${rua.nome} |
              Pos ${index + 1} |
              RZ ${pos.rz || '-'} |
              Vol ${pos.volume || '-'}
            </label>
          `;
        }
      });
    });
  });

  modal.classList.remove('hidden');
};

// -------------------------------
// CONFIRMAR EXPEDIÇÃO
// -------------------------------
window.confirmarExpedicao = function () {
  const checks =
    document.querySelectorAll('#listaExpedicao input:checked');

  if (!checks.length) {
    alert('Selecione ao menos uma gaylord');
    return;
  }

  const saldo = calcularSaldoLote(contextoExpedicao.lote);

  if (checks.length > saldo) {
    alert(`Saldo insuficiente (${saldo})`);
    return;
  }

  const detalhes = [];

  checks.forEach(c => {
    detalhes.push({
      area: c.dataset.area,
      rua: c.dataset.rua,
      posicao: c.dataset.posicao,
      rz: c.dataset.rz,
      volume: c.dataset.volume
    });

    // limpa do mapa
    state.areas.forEach(a => {
      a.ruas.forEach(r => {
        r.posicoes.forEach(p => {
          if (
            p.lote === contextoExpedicao.lote &&
            p.rz === c.dataset.rz &&
            p.volume === c.dataset.volume
          ) {
            p.ocupada = false;
            p.lote = null;
            p.rz = null;
            p.volume = null;
          }
        });
      });
    });
  });

  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: contextoExpedicao.lote,
    tipo: checks.length === saldo ? 'TOTAL' : 'PARCIAL',
    quantidadeExpedida: checks.length,
    quantidadeTotal: saldo,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes
  });

  saveState();
  fecharModalExpedicao();
  renderMapa();
  renderDashboard();
  renderExpedidos();
};

// -------------------------------
window.fecharModalExpedicao = function () {
  document
    .getElementById('modalExpedicao')
    .classList.add('hidden');
};
