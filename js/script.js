document.addEventListener('DOMContentLoaded', () => {

  // =======================
  // ELEMENTOS DOM
  // =======================
  const mapa = document.getElementById('mapa');
  const dashboard = document.getElementById('dashboard');
  const modal = document.getElementById('modal');
  const modalLote = document.getElementById('modalLote');
  const modalRz = document.getElementById('modalRz');
  const modalVolume = document.getElementById('modalVolume');
  const lotesExpedidos = document.getElementById('lotesExpedidos');
  const buscaInput = document.getElementById('buscaInput');

  // Se não existir mapa, não executa (evita travar outras páginas)
  if (!mapa) return;

  // =======================
  // ESTADO GLOBAL
  // =======================
  let mapaSalvo = JSON.parse(localStorage.getItem('mapa')) || [];
  let lotesCadastrados = JSON.parse(localStorage.getItem('lotes')) || {};
  let historicoExpedidos = JSON.parse(localStorage.getItem('historicoExpedidos')) || [];
  let posicaoAtual = null;

  // =======================
  // UTILIDADES
  // =======================
  function salvarTudo() {
    localStorage.setItem('mapa', JSON.stringify(mapaSalvo));
    localStorage.setItem('lotes', JSON.stringify(lotesCadastrados));
    localStorage.setItem('historicoExpedidos', JSON.stringify(historicoExpedidos));
  }

  function gerarCor() {
    return `hsl(${Math.random() * 360}, 70%, 70%)`;
  }

  // =======================
  // CADASTRO DE LOTE
  // =======================
  window.cadastrarLote = function () {
    const nome = loteNome.value.trim();
    const total = Number(loteTotal.value);
    if (!nome || total <= 0) return alert('Informe nome e quantidade');
    if (lotesCadastrados[nome]) return alert('Lote já existe');

    lotesCadastrados[nome] = { total, cor: gerarCor() };
    loteNome.value = '';
    loteTotal.value = '';
    salvarTudo();
    renderDashboard();
  };

  window.alterarQuantidadeLote = function (nome) {
    const alocados = contarGaylordsDoLote(nome);
    const novo = Number(prompt(
      `Quantidade nova para o lote "${nome}" (alocados: ${alocados})`,
      lotesCadastrados[nome].total
    ));
    if (isNaN(novo) || novo < alocados)
      return alert(`Quantidade inválida! Deve ser >= ${alocados}`);

    lotesCadastrados[nome].total = novo;
    salvarTudo();
    renderDashboard();
  };

  window.excluirLote = function (nome) {
    if (contarGaylordsDoLote(nome) > 0)
      return alert('Não é possível excluir. Existem gaylords alocadas');
    if (!confirm(`Excluir lote "${nome}"?`)) return;

    delete lotesCadastrados[nome];
    salvarTudo();
    renderDashboard();
  };

  // =======================
  // ÁREA / RUA
  // =======================
  window.cadastrarArea = function () {
    const nome = areaNome.value.trim();
    if (!nome) return alert('Informe nome da área');

    mapaSalvo.push({ nome, ruas: [] });
    areaNome.value = '';
    salvarTudo();
    renderMapa();
  };

  window.excluirArea = function (index) {
    const possuiAlocacao = mapaSalvo[index].ruas.some(r =>
      r.posicoes.some(p => p)
    );
    if (possuiAlocacao)
      return alert('Não é possível excluir. Existem gaylords alocadas!');
    if (!confirm('Excluir área?')) return;

    mapaSalvo.splice(index, 1);
    salvarTudo();
    renderMapa();
  };

  window.adicionarRua = function (aIndex) {
    const nome = prompt('Nome da rua');
    if (!nome) return;

    const qtd = Number(prompt('Quantidade de posições'));
    if (isNaN(qtd) || qtd <= 0) return alert('Quantidade inválida');

    mapaSalvo[aIndex].ruas.push({ nome, posicoes: Array(qtd).fill(null) });
    salvarTudo();
    renderMapa();
  };

  window.excluirRua = function (aIndex, rIndex) {
    const rua = mapaSalvo[aIndex].ruas[rIndex];
    if (rua.posicoes.some(p => p))
      return alert('Não é possível excluir. Existem gaylords alocadas!');
    if (!confirm('Excluir rua?')) return;

    mapaSalvo[aIndex].ruas.splice(rIndex, 1);
    salvarTudo();
    renderMapa();
  };

  // =======================
  // MAPA
  // =======================
  function renderMapa() {
    mapa.innerHTML = '';

    mapaSalvo.forEach((area, aIndex) => {
      const areaDiv = document.createElement('div');
      areaDiv.className = 'area';
      areaDiv.innerHTML = `
        <strong>${area.nome}</strong>
        <button onclick="excluirArea(${aIndex})">Excluir Área</button>
      `;

      area.ruas.forEach((rua, rIndex) => {
        const ruaDiv = document.createElement('div');
        ruaDiv.className = 'rua';
        ruaDiv.innerHTML = `
          Rua ${rua.nome}
          <button onclick="excluirRua(${aIndex},${rIndex})">Excluir Rua</button>
        `;

        const posDiv = document.createElement('div');
        posDiv.className = 'posicoes';

        rua.posicoes.forEach((pos, pIndex) => {
          const d = document.createElement('div');
          d.className = 'posicao';

          if (pos) {
            d.classList.add('ocupada');
            d.style.background = lotesCadastrados[pos.lote]?.cor || '#ccc';
            d.dataset.lote = pos.lote;
            d.dataset.rz = pos.rz;
            d.dataset.volume = pos.volume || '';
          }

          d.onclick = () => abrirModal(aIndex, rIndex, pIndex);
          posDiv.appendChild(d);
        });

        ruaDiv.appendChild(posDiv);
        areaDiv.appendChild(ruaDiv);
      });

      const btnRua = document.createElement('button');
      btnRua.textContent = 'Adicionar Rua';
      btnRua.onclick = () => adicionarRua(aIndex);
      areaDiv.appendChild(btnRua);

      mapa.appendChild(areaDiv);
    });

    renderDashboard();
    renderExpedidos();
  }

  // =======================
  // MODAL
  // =======================
  function abrirModal(a, r, p) {
    posicaoAtual = { a, r, p };
    const pos = mapaSalvo[a].ruas[r].posicoes[p];

    carregarLotesNoModal(pos?.lote || '');
    modalRz.value = pos?.rz || '';
    modalVolume.value = pos?.volume || '';
    modal.classList.remove('hidden');
  }

  window.fecharModal = () => modal.classList.add('hidden');

  function carregarLotesNoModal(selecionado = '') {
    modalLote.innerHTML = '<option value="">Selecione o lote</option>';
    Object.keys(lotesCadastrados).forEach(l => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l;
      if (l === selecionado) opt.selected = true;
      modalLote.appendChild(opt);
    });
  }

  // =======================
  // CONFIRMAR ENDEREÇO
  // =======================
  window.confirmarEndereco = function () {
    const lote = modalLote.value;
    const rz = modalRz.value.trim();
    const volume = modalVolume.value.trim() || null;

    if (!lote || !rz) return alert('Lote e RZ obrigatórios');

    const totalLote = lotesCadastrados[lote].total;
    const alocados = contarGaylordsDoLote(lote);
    const posAtual = mapaSalvo[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p];

    if (!posAtual && alocados >= totalLote)
      return alert(`Lote "${lote}" já completo`);

    mapaSalvo[posicaoAtual.a].ruas[posicaoAtual.r].posicoes[posicaoAtual.p] = {
      lote, rz, volume
    };

    salvarTudo();
    fecharModal();
    renderMapa();
  };

  // =======================
  // CONTADOR
  // =======================
  function contarGaylordsDoLote(nome) {
    let total = 0;
    mapaSalvo.forEach(area =>
      area.ruas.forEach(rua =>
        rua.posicoes.forEach(p => {
          if (p?.lote === nome) total++;
        })
      )
    );
    return total;
  }

  // =======================
  // DASHBOARD
  // =======================
  function renderDashboard() {
    if (!dashboard) return;
    dashboard.innerHTML = '';

    Object.entries(lotesCadastrados).forEach(([nome, data]) => {
      const usado = contarGaylordsDoLote(nome);
      const perc = data.total > 0 ? (usado / data.total) * 100 : 0;

      const div = document.createElement('div');
      div.className = 'lote-card';
      div.innerHTML = `
        <strong>${nome}</strong><br>
        ${usado} / ${data.total}
        <div class="progress-bar">
          <div class="progress-fill" style="width:${perc}%;background:${data.cor}"></div>
        </div>
        <button onclick="alterarQuantidadeLote('${nome}')">Alterar</button>
        <button onclick="excluirLote('${nome}')">Excluir</button>
        <button onclick="expedirLote('${nome}')">Expedir</button>
      `;
      dashboard.appendChild(div);
    });
  }

  // =======================
  // EXPEDIÇÃO + HISTÓRICO
  // =======================
  window.expedirLote = function (nome) {
    const alocados = [];

    mapaSalvo.forEach(area =>
      area.ruas.forEach(rua => {
        rua.posicoes = rua.posicoes.map(pos => {
          if (pos?.lote === nome) {
            alocados.push({ rz: pos.rz, volume: pos.volume || '-' });
            return null;
          }
          return pos;
        });
      })
    );

    if (alocados.length === 0) return alert('Nenhuma gaylord alocada');

    historicoExpedidos.push({
      lote: nome,
      expedidos: alocados.length,
      totalOriginal: lotesCadastrados[nome].total,
      data: new Date().toLocaleString(),
      detalhes: alocados
    });

    delete lotesCadastrados[nome];
    salvarTudo();
    renderMapa();
  };

  function renderExpedidos() {
    if (!lotesExpedidos) return;
    lotesExpedidos.innerHTML = '';

    historicoExpedidos.forEach((item, i) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${item.lote}</strong> - ${item.expedidos}
        <button onclick="verDetalhes(${i})">Detalhes</button>
      `;
      lotesExpedidos.appendChild(div);
    });
  }

  window.verDetalhes = function (i) {
    const item = historicoExpedidos[i];
    let txt = '';
    item.detalhes.forEach((d, idx) =>
      txt += `${idx + 1} - RZ:${d.rz} Vol:${d.volume}\n`
    );
    alert(txt);
  };

  // =======================
  // BUSCA
  // =======================
  window.buscar = function () {
    const termo = buscaInput.value.trim().toLowerCase();
    document.querySelectorAll('.posicao').forEach(pos => {
      const ok =
        pos.dataset.lote?.toLowerCase().includes(termo) ||
        pos.dataset.rz?.toLowerCase().includes(termo) ||
        pos.dataset.volume?.toLowerCase().includes(termo);
      pos.classList.toggle('highlight', termo && ok);
    });
  };

  // =======================
  // INIT
  // =======================
  renderMapa();

});
