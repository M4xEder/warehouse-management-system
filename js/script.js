document.addEventListener('DOMContentLoaded', () => {

  // =======================
  // ELEMENTOS DOM
  // =======================
  const mapa = document.getElementById('mapa');
  const dashboard = document.getElementById('dashboard');
  const lotesExpedidos = document.getElementById('lotesExpedidos');
  const buscaInput = document.getElementById('buscaInput');

  const areaNome = document.getElementById('areaNome');
  const loteNome = document.getElementById('loteNome');
  const loteTotal = document.getElementById('loteTotal');

  const modal = document.getElementById('modal');
  const modalLote = document.getElementById('modalLote');
  const modalRz = document.getElementById('modalRz');
  const modalVolume = document.getElementById('modalVolume');

  // =======================
  // ESTADO
  // =======================
  let mapaSalvo = JSON.parse(localStorage.getItem('mapa')) || [];
  let lotesCadastrados = JSON.parse(localStorage.getItem('lotes')) || {};
  let historicoExpedidos = JSON.parse(localStorage.getItem('historicoExpedidos')) || [];
  let posicaoAtual = null;

  function salvarTudo() {
    localStorage.setItem('mapa', JSON.stringify(mapaSalvo));
    localStorage.setItem('lotes', JSON.stringify(lotesCadastrados));
    localStorage.setItem('historicoExpedidos', JSON.stringify(historicoExpedidos));
  }

  function gerarCor() {
    return `hsl(${Math.random() * 360},70%,70%)`;
  }

  // =======================
  // CADASTROS
  // =======================
  window.cadastrarArea = function () {
    const nome = areaNome.value.trim();
    if (!nome) return alert('Informe nome da área');
    mapaSalvo.push({ nome, ruas: [] });
    areaNome.value = '';
    salvarTudo();
    renderMapa();
  };

  window.cadastrarLote = function () {
    const nome = loteNome.value.trim();
    const total = Number(loteTotal.value);
    if (!nome || total <= 0) return alert('Dados inválidos');
    if (lotesCadastrados[nome]) return alert('Lote já existe');
    lotesCadastrados[nome] = { total, cor: gerarCor() };
    loteNome.value = '';
    loteTotal.value = '';
    salvarTudo();
    renderMapa();
  };

  // =======================
  // MAPA
  // =======================
  function renderMapa() {
    if (!mapa) return;

    mapa.innerHTML = '';

    mapaSalvo.forEach((area, aIndex) => {
      const areaDiv = document.createElement('div');
      areaDiv.className = 'area';
      areaDiv.innerHTML = `<strong>${area.nome}</strong>`;

      area.ruas.forEach((rua, rIndex) => {
        const ruaDiv = document.createElement('div');
        ruaDiv.className = 'rua';
        ruaDiv.innerText = `Rua ${rua.nome}`;

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
    modal.classList.remove('hidden');
    carregarLotes();
  }

  window.fecharModal = () => modal.classList.add('hidden');

  function carregarLotes() {
    modalLote.innerHTML = '<option value="">Selecione</option>';
    Object.keys(lotesCadastrados).forEach(l => {
      const o = document.createElement('option');
      o.value = l;
      o.textContent = l;
      modalLote.appendChild(o);
    });
  }

  // =======================
  // DASHBOARD
  // =======================
  function renderDashboard() {
    dashboard.innerHTML = '';
    Object.entries(lotesCadastrados).forEach(([nome, data]) => {
      const div = document.createElement('div');
      div.className = 'lote-card';
      div.innerHTML = `<strong>${nome}</strong><br>${data.total}`;
      dashboard.appendChild(div);
    });
  }

  function renderExpedidos() {
    lotesExpedidos.innerHTML = historicoExpedidos.length
      ? ''
      : '<p>Nenhum lote expedido</p>';
  }

  // =======================
  // BUSCA
  // =======================
  window.buscar = function () {
    const termo = buscaInput.value.toLowerCase();
    document.querySelectorAll('.posicao').forEach(p => {
      const t = `${p.dataset.lote}${p.dataset.rz}${p.dataset.volume}`.toLowerCase();
      p.classList.toggle('highlight', t.includes(termo));
    });
  };

  window.limparBusca = function () {
    document.querySelectorAll('.posicao.highlight')
      .forEach(p => p.classList.remove('highlight'));
  };

  renderMapa();
});
