// ===============================
// DASHBOARD.JS — 100% BLINDADO
// ===============================

function idEquals(a, b) {
  return String(a) === String(b);
}

function atualizarSistema() {
  saveState();
  renderLotesAtivos();
  if (typeof renderMapa === "function") {
    renderMapa();
  }
}

// ===============================
// LOTES ATIVOS
// ===============================

window.renderLotesAtivos = function () {
  const container = document.getElementById("lotesAtivos");
  if (!container) return;

  container.innerHTML = "";

  state.lotes
    .filter(l => l.status !== "total")
    .forEach(lote => {

      const totalAlocado = state.areas
        .flatMap(a => a.ruas)
        .flatMap(r => r.posicoes)
        .filter(p => p.loteId && idEquals(p.loteId, lote.id))
        .length;

      let statusClass = "";
      if (totalAlocado === 0) statusClass = "status-ativo";
      if (totalAlocado > 0 && totalAlocado < lote.quantidade)
        statusClass = "status-parcial";
      if (totalAlocado >= lote.quantidade)
        statusClass = "status-total";

      const card = document.createElement("div");
      card.className = `lote-card ${statusClass}`;

      card.innerHTML = `
        <h3>${lote.nome}</h3>
        <p>Total: ${lote.quantidade}</p>
        <p>Alocado: ${totalAlocado}</p>

        <div class="acoes">
          <button onclick="abrirModalExpedicao('${String(lote.id)}')">
            Expedir
          </button>

          <button onclick="alterarQuantidadeLote('${String(lote.id)}')">
            Alterar Quantidade
          </button>

          <button class="danger"
            onclick="excluirLote('${String(lote.id)}')">
            Excluir
          </button>
        </div>
      `;

      container.appendChild(card);
    });
};

// ===============================
// ALTERAR QUANTIDADE
// ===============================

window.alterarQuantidadeLote = function (id) {
  const lote = state.lotes.find(l => idEquals(l.id, id));
  if (!lote) return alert("Lote não encontrado.");

  const novaQtd = prompt("Nova quantidade:", lote.quantidade);
  if (!novaQtd) return;

  lote.quantidade = parseInt(novaQtd);
  atualizarSistema();
};

// ===============================
// EXCLUIR LOTE
// ===============================

window.excluirLote = function (id) {
  const lote = state.lotes.find(l => idEquals(l.id, id));
  if (!lote) return alert("Lote não encontrado.");

  if (!confirm("Deseja excluir este lote?")) return;

  // Remove gaylords do mapa
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.loteId && idEquals(pos.loteId, id)) {
          pos.loteId = null;
        }
      });
    });
  });

  state.lotes = state.lotes.filter(l => !idEquals(l.id, id));

  atualizarSistema();
};

// ===============================
// EXPEDIÇÃO
// ===============================

window.abrirModalExpedicao = function (id) {
  const lote = state.lotes.find(l => idEquals(l.id, id));
  if (!lote) return alert("Lote não encontrado.");

  const qtd = prompt("Quantidade para expedir:");
  if (!qtd) return;

  expedirLote(id, parseInt(qtd));
};

window.expedirLote = function (id, quantidade) {
  const lote = state.lotes.find(l => idEquals(l.id, id));
  if (!lote) return alert("Lote não encontrado.");

  let removidas = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (
          pos.loteId &&
          idEquals(pos.loteId, id) &&
          removidas < quantidade
        ) {
          pos.loteId = null;
          removidas++;
        }
      });
    });
  });

  if (removidas === 0)
    return alert("Nenhuma gaylord alocada encontrada.");

  const totalAlocado = state.areas
    .flatMap(a => a.ruas)
    .flatMap(r => r.posicoes)
    .filter(p => p.loteId && idEquals(p.loteId, id))
    .length;

  if (totalAlocado === 0) {
    lote.status = "total";
  } else {
    lote.status = "parcial";
  }

  atualizarSistema();
};
