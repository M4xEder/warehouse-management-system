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
window.excluirArea = async function (areaId) {

  if (areaTemRuas(areaId)) {
    if (!confirm('Essa área possui ruas vinculadas. Deseja realmente excluir tudo?')) {
      return;
    }
  } else {
    if (!confirm('Excluir área?')) return;
  }

  try {

    const { error } = await window.supabaseClient
      .from('areas')
      .delete()
      .eq('id', areaId);

    if (error) throw error;

    // Remove área
    state.areas = state.areas.filter(a => a.id !== areaId);

    // Remove ruas da área
    const ruasRemovidas = state.ruas.filter(r => r.area_id === areaId);
    const ruasIds = ruasRemovidas.map(r => r.id);

    state.ruas = state.ruas.filter(r => r.area_id !== areaId);

    // Remove posições das ruas removidas
    state.posicoes = state.posicoes.filter(p => !ruasIds.includes(p.rua_id));

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

    // Criar posições
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

  if (ruaTemPosicoesOcupadas(ruaId)) {
    if (!confirm('Essa rua possui posições ocupadas. Deseja realmente excluir?')) {
      return;
    }
  } else {
    if (!confirm('Excluir rua?')) return;
  }

  try {

    const { error } = await window.supabaseClient
      .from('ruas')
      .delete()
      .eq('id', ruaId);

    if (error) throw error;

    // Remove rua
    state.ruas = state.ruas.filter(r => r.id !== ruaId);

    // Remove posições vinculadas
    state.posicoes = state.posicoes.filter(p => p.rua_id !== ruaId);

    renderMapa();

  } catch (err) {
    console.error('Erro ao excluir rua:', err);
    alert('Erro ao excluir rua');
  }
};

// ===============================
// RENDER MAPA (ATUALIZADO E BLINDADO)
// ===============================
window.renderMapa = function () {

  const mapa = document.getElementById('mapa');
  if (!mapa) return;

  if (!state?.areas || !state?.ruas || !state?.posicoes) {
    console.warn('Estado ainda não carregado');
    return;
  }

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
        posDiv.textContent = pos.numero;

        // 🔥 RESET VISUAL (EVITA BUG)
        posDiv.style.backgroundColor = '';
        posDiv.style.color = '';
        posDiv.classList.remove('ocupada', 'livre', 'highlight');

        if (pos.ocupada) {

          const lote = state.lotes?.find(l => l.id === pos.lote_id);

          posDiv.classList.add('ocupada');

          if (lote?.cor) {
            posDiv.style.backgroundColor = lote.cor;
            posDiv.style.color = '#fff';
          }

          posDiv.title = `
          Lote: ${lote?.nome || '-'}
          RZ: ${pos.rz || '-'}
          Volume: ${pos.volume || '-'}
          `;

        } else {
          posDiv.classList.add('livre');
        }

        // 🔥 AQUI ESTÁ O DESTAQUE DA BUSCA
        if (pos._highlight === true) {
          posDiv.classList.add('highlight');
        }

        posDiv.onclick = () => {
          if (typeof abrirModalPorId === "function") {
            abrirModalPorId(pos.id);
          }
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

  if (typeof atualizarDashboard === 'function') {
    atualizarDashboard();
  }
};
