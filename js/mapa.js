// ===============================
// MAPA.JS — RENDERIZAÇÃO DO ARMAZÉM
// ===============================

function renderMapa() {
  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  mapa.innerHTML = '';

  state.areas.forEach((area, aIndex) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    // ---------- HEADER DA ÁREA ----------
    const headerArea = document.createElement('div');
    headerArea.innerHTML = `
      <strong>${area.nome}</strong>
      <button onclick="excluirArea('${area.id}')">Excluir Área</button>
    `;
    areaDiv.appendChild(headerArea);

    // ---------- RUAS ----------
    area.ruas.forEach((rua, rIndex) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        Rua ${rua.nome}
        <button onclick="excluirRua('${area.id}','${rua.id}')">Excluir Rua</button>
      `;

      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, pIndex) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        if (pos.ocupada) {
          p.classList.add('ocupada');
          p.title = `Lote: ${pos.lote}\nRZ: ${pos.rz}\nVolume: ${pos.volume || '-'}`;

          const lote = state.lotes.find(l => l.nome === pos.lote);
          if (lote) {
            p.style.background = lote.cor;
          }
        }

        // 👉 ABERTURA DO MODAL (CORRETA)
        p.onclick = () => abrirModal(aIndex, rIndex, pIndex);

        posicoesDiv.appendChild(p);
      });

      ruaDiv.appendChild(posicoesDiv);
      areaDiv.appendChild(ruaDiv);
    });

    // ---------- BOTÃO ADD RUA ----------
    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => adicionarRua(area.id);
    areaDiv.appendChild(btnRua);

    mapa.appendChild(areaDiv);
  });

  // Atualiza dashboard sempre que renderiza mapa
  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
}

// ===============================
// CRUD ÁREA
// ===============================
function cadastrarArea() {
  const input = document.getElementById('areaNome');
  const nome = input.value.trim();

  if (!nome) {
    alert('Informe o nome da área');
    return;
  }

  state.areas.push(Model.criarArea(nome));
  input.value = '';

  saveState();
  renderMapa();
}

function excluirArea(areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  if (!Model.podeExcluirArea(area)) {
    alert('Não é possível excluir. Existem gaylords alocados.');
    return;
  }

  if (!confirm('Excluir área?')) return;

  state.areas = state.areas.filter(a => a.id !== areaId);
  saveState();
  renderMapa();
}

// ===============================
// CRUD RUA
// ===============================
function adicionarRua(areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const qtd = Number(prompt('Quantidade de posições'));
  if (!qtd || qtd <= 0) {
    alert('Quantidade inválida');
    return;
  }

  area.ruas.push(Model.criarRua(nome, qtd));
  saveState();
  renderMapa();
}

function excluirRua(areaId, ruaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const rua = area.ruas.find(r => r.id === ruaId);
  if (!rua) return;

  if (!Model.podeExcluirRua(rua)) {
    alert('Não é possível excluir. Existem gaylords alocados.');
    return;
  }

  if (!confirm('Excluir rua?')) return;

  area.ruas = area.ruas.filter(r => r.id !== ruaId);
  saveState();
  renderMapa();
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  renderMapa();
});
