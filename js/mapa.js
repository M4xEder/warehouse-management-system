// ===============================
// MAPA.JS — ENDEREÇAMENTO PROFISSIONAL
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
      .select()
      .single();

    if (error) throw error;

    state.areas.push(data);
    input.value = '';
    renderMapa();

  } catch (err) {
    console.error('Erro ao cadastrar área:', err);
    alert('Erro ao criar área');
  }
};



// ===============================
// EXCLUIR ÁREA
// ===============================
window.excluirArea = async function (id) {

  if (!confirm('Excluir área? Isso removerá ruas e posições vinculadas.')) return;

  try {

    const { error } = await window.supabaseClient
      .from('areas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Atualiza estado local
    state.areas = state.areas.filter(a => a.id !== id);
    state.ruas = state.ruas.filter(r => r.area_id !== id);
    state.posicoes = state.posicoes.filter(p =>
      state.ruas.some(r => r.id === p.rua_id)
    );

    renderMapa();

  } catch (err) {
    console.error('Erro ao excluir área:', err);
    alert('Erro ao excluir área');
  }
};



// ===============================
// CRIAR RUA + POSIÇÕES
// ===============================
window.criarRua = async function (areaId) {

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const quantidade = Number(prompt('Quantas posições essa rua terá?'));
  if (!quantidade || quantidade <= 0) {
    alert('Quantidade inválida.');
    return;
  }

  try {

    // 1️⃣ Criar rua
    const { data: novaRua, error: erroRua } =
      await window.supabaseClient
        .from('ruas')
        .insert([{
          nome,
          area_id: areaId,
          quantidade_posicoes: quantidade
        }])
        .select()
        .single();

    if (erroRua) throw erroRua;

    state.ruas.push(novaRua);

    // 2️⃣ Criar posições
    const posicoesCriadas = [];

    for (let i = 1; i <= quantidade; i++) {
      posicoesCriadas.push({
        rua_id: novaRua.id,
        numero: i,
        ocupada: false
      });
    }

    const { data: posData, error: erroPos } =
      await window.supabaseClient
        .from('posicoes')
        .insert(posicoesCriadas)
        .select();

    if (erroPos) throw erroPos;

    state.posicoes.push(...posData);

    renderMapa();

  } catch (err) {
    console.error('Erro ao criar rua:', err);
    alert('Erro ao criar rua');
  }
};



// ===============================
// EXCLUIR RUA
// ===============================
window.excluirRua = async function (ruaId) {

  if (!confirm('Excluir rua? Isso removerá todas as posições dela.')) return;

  try {

    const { error } = await window.supabaseClient
      .from('ruas')
      .delete()
      .eq('id', ruaId);

    if (error) throw error;

    state.ruas = state.ruas.filter(r => r.id !== ruaId);
    state.posicoes = state.posicoes.filter(p => p.rua_id !== ruaId);

    renderMapa();

  } catch (err) {
    console.error('Erro ao excluir rua:', err);
    alert('Erro ao excluir rua');
  }
};

// ===============================
// RENDER MAPA
// ===============================
window.renderMapa = function () {

  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  mapa.innerHTML = '';

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

    const ruasDaArea = state.ruas.filter(r => r.area_id === area.id);

    ruasDaArea.forEach(rua => {

      const ruaDiv = document.createElement('div');
      ruaDiv.className = 'rua';

      ruaDiv.innerHTML = `
        <div class="rua-header">
          Rua ${rua.nome}
          <button class="danger" onclick="excluirRua('${rua.id}')">
            Excluir Rua
          </button>
        </div>
      `;

      const posicoesDaRua = state.posicoes
        .filter(p => p.rua_id === rua.id)
        .sort((a, b) => a.numero - b.numero);

      const grid = document.createElement('div');
      grid.className = 'posicoes';

      posicoesDaRua.forEach(pos => {

        const posDiv = document.createElement('div');
        posDiv.className = 'posicao';

        if (pos.ocupada) {
          posDiv.classList.add('ocupada');
        } else {
          posDiv.classList.add('livre');
        }

        posDiv.textContent = pos.numero;

        // 🔥 AQUI ESTAVA FALTANDO
        posDiv.onclick = () => {
          abrirModalPorId(pos.id);
        };

        grid.appendChild(posDiv);
      });

      ruaDiv.appendChild(grid);
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
