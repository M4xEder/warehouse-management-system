/* // ===============================
// MAPA.JS — CONTROLE DO MAPA (SEGURO)
// ===============================

// ---------- HELPERS ----------
function criarPosicao() {
  return {
    ocupada: false,
    lote: null,
    rz: null,
    volume: null
  };
}

function criarRua(nome, qtd) {
  return {
    id: crypto.randomUUID(),
    nome,
    posicoes: Array.from({ length: qtd }, criarPosicao)
  };
}

function criarArea(nome) {
  return {
    id: crypto.randomUUID(),
    nome,
    ruas: []
  };
}

// ---------- CRUD ÁREA ----------
window.cadastrarArea = function () {
  const input = document.getElementById('areaNome');
  if (!input || !input.value.trim()) {
    alert('Informe o nome da área');
    return;
  }

  state.areas.push(criarArea(input.value.trim()));
  input.value = '';
  saveState();
  renderMapa();
};

window.excluirArea = function (id) {
  const area = state.areas.find(a => a.id === id);
  if (!area) return;

  if (area.ruas.some(r => r.posicoes.some(p => p.ocupada))) {
    alert('Área possui gaylords alocadas');
    return;
  }

  if (!confirm('Excluir área?')) return;

  state.areas = state.areas.filter(a => a.id !== id);
  saveState();
  renderMapa();
};

// ---------- CRUD RUA ----------
window.adicionarRua = function (areaId) {
  const area = state.areas.find(a => a.id === areaId);
  if (!area) return;

  const nome = prompt('Nome da rua');
  const qtd = Number(prompt('Quantidade de posições'));

  if (!nome || qtd <= 0) {
    alert('Dados inválidos');
    return;
  }

  area.ruas.push(criarRua(nome, qtd));
  saveState();
  renderMapa();
};

window.excluirRua = function (areaId, ruaId) {
  const area = state.areas.find(a => a.id === areaId);
  const rua = area?.ruas.find(r => r.id === ruaId);
  if (!rua) return;

  if (rua.posicoes.some(p => p.ocupada)) {
    alert('Rua possui gaylords alocadas');
    return;
  }

  if (!confirm('Excluir rua?')) return;

  area.ruas = area.ruas.filter(r => r.id !== ruaId);
  saveState();
  renderMapa();
};

// ---------- RENDER MAPA ----------
window.renderMapa = function () {
  const mapa = document.getElementById('mapa');
  if (!mapa || !state || !Array.isArray(state.areas)) return;

  mapa.innerHTML = '';

  state.areas.forEach((area, ai) => {
    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <button class="danger" onclick="excluirArea('${area.id}')">
          Excluir Área
        </button>
      </div>
    `;

    area.ruas.forEach((rua, ri) => {
      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          Rua ${rua.nome}
          <button class="danger"
            onclick="excluirRua('${area.id}','${rua.id}')">
            Excluir Rua
          </button>
        </div>
      `;

      const posicoesDiv = document.createElement('div');
      posicoesDiv.className = 'posicoes';

      rua.posicoes.forEach((pos, pi) => {
        const p = document.createElement('div');
        p.className = 'posicao';

        // -------- POSIÇÃO OCUPADA --------
        if (pos.ocupada) {
          p.classList.add('ocupada');

          const lote = state.lotes?.find(l => l.nome === pos.lote);
          if (lote?.cor) {
            p.style.background = lote.cor;
          }

          p.title = `Lote: ${pos.lote}\nRZ: ${pos.rz}\nVol: ${pos.volume}`;
        }

        // 🔎 DESTAQUE DA BUSCA
        if (pos._highlight) {
          p.classList.add('highlight');
        }

        // -------- CLIQUE SEGURO --------
        p.addEventListener('click', () => {
          if (typeof abrirModal !== 'function') {
            alert('Função abrirModal não carregada');
            return;
          }
          abrirModal(ai, ri, pi);
        });

        posicoesDiv.appendChild(p);
      });

      ruaDiv.appendChild(posicoesDiv);
      areaDiv.appendChild(ruaDiv);
    });

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => adicionarRua(area.id);

    areaDiv.appendChild(btnRua);
    mapa.appendChild(areaDiv);
  });

  // Atualiza dashboard junto
  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
};



// ===============================
// CORRIGIR LOTES ANTIGOS (ADD COR)
// ===============================
(function corrigirLotesSemCor() {

  if (!Array.isArray(state.lotes)) return;

  const cores = [
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316'
  ];

  let alterado = false;

  state.lotes.forEach(lote => {
    if (!lote.cor) {
      lote.cor = cores[Math.floor(Math.random() * cores.length)];
      alterado = true;
    }
  });

  if (alterado) {
    saveState();
  }

})();



*/

// ===============================
// MAPA.JS — CONTROLE COMPLETO (SUPABASE CORRIGIDO)
// ===============================


// ===============================
// CRIAR ÁREA
// ===============================
window.cadastrarArea = async function () {

  const input = document.getElementById('areaNome');

  if (!input || !input.value.trim()) {
    alert('Informe o nome da área');
    return;
  }

  const nome = input.value.trim();

  try {

    const { data, error } = await window.supabaseClient
      .from('areas')
      .insert([{ nome }])
      .select();

    if (error) {
      console.error(error);
      alert('Erro ao criar área');
      return;
    }

    state.areas.push(data[0]);
    input.value = '';
    renderMapa();

  } catch (err) {
    console.error('Erro geral ao cadastrar área:', err);
  }
};



// ===============================
// EXCLUIR ÁREA
// ===============================
window.excluirArea = async function (id) {

  if (!confirm('Excluir área?')) return;

  try {

    const { error } = await window.supabaseClient
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Erro ao excluir área');
      return;
    }

    state.areas = state.areas.filter(a => a.id !== id);
    state.ruas = state.ruas.filter(r => r.area_id !== id);

    renderMapa();

  } catch (err) {
    console.error('Erro geral ao excluir área:', err);
  }
};



// ===============================
// CRIAR RUA
// ===============================
window.criarRua = async function (areaId) {

  const nome = prompt('Nome da rua');
  if (!nome) return;

  try {

    const { data, error } = await window.supabaseClient
      .from('ruas')
      .insert([{
        nome,
        area_id: areaId
      }])
      .select();

    if (error) {
      console.error(error);
      alert('Erro ao criar rua');
      return;
    }

    state.ruas.push(data[0]);
    renderMapa();

  } catch (err) {
    console.error('Erro geral ao criar rua:', err);
  }
};



// ===============================
// EXCLUIR RUA
// ===============================
window.excluirRua = async function (ruaId) {

  if (!confirm('Excluir rua?')) return;

  try {

    const { error } = await window.supabaseClient
      .from('ruas')
      .delete()
      .eq('id', ruaId);

    if (error) {
      console.error(error);
      alert('Erro ao excluir rua');
      return;
    }

    state.ruas = state.ruas.filter(r => r.id !== ruaId);
    renderMapa();

  } catch (err) {
    console.error('Erro geral ao excluir rua:', err);
  }
};



// ===============================
// RENDER MAPA
// ===============================
window.renderMapa = function () {

  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  mapa.innerHTML = '';

  if (!Array.isArray(state.areas)) return;

  state.areas.forEach(area => {

    const areaDiv = document.createElement('div');
    areaDiv.className = 'area';

    areaDiv.innerHTML = `
      <div class="area-header">
        <strong>${area.nome}</strong>
        <button class="danger" onclick="excluirArea('${area.id}')">
          Excluir Área
        </button>
      </div>
    `;

    // 🔥 Filtra ruas relacionadas à área
    const ruasDaArea = Array.isArray(state.ruas)
      ? state.ruas.filter(r => r.area_id === area.id)
      : [];

    ruasDaArea.forEach(rua => {

      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          Rua ${rua.nome}
          <button class="danger"
            onclick="excluirRua('${rua.id}')">
            Excluir Rua
          </button>
        </div>
      `;

      areaDiv.appendChild(ruaDiv);
    });

    const btnRua = document.createElement('button');
    btnRua.textContent = 'Adicionar Rua';
    btnRua.onclick = () => criarRua(area.id);

    areaDiv.appendChild(btnRua);
    mapa.appendChild(areaDiv);
  });

  if (typeof renderDashboard === 'function') {
    renderDashboard();
  }
};
