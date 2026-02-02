document.addEventListener('DOMContentLoaded', () => {

  // =======================
  // ELEMENTOS
  // =======================
  const mapa = document.getElementById('mapa');
  const dashboard = document.getElementById('dashboard');
  const modal = document.getElementById('modal');
  const modalLote = document.getElementById('modalLote');
  const modalRz = document.getElementById('modalRz');
  const modalVolume = document.getElementById('modalVolume');
  const lotesExpedidos = document.getElementById('lotesExpedidos');
  const buscaInput = document.getElementById('buscaInput');

  if (!mapa) return;

  // =======================
  // ESTADO
  // =======================
  let mapaSalvo = JSON.parse(localStorage.getItem('mapa')) || [];
  let lotesCadastrados = JSON.parse(localStorage.getItem('lotes')) || {};
  let historicoExpedidos = JSON.parse(localStorage.getItem('historicoExpedidos')) || [];
  let posicaoAtual = null;

  // =======================
  // UTIL
  // =======================
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
  window.cadastrarArea = () => {
    if (!areaNome.value.trim()) return;
    mapaSalvo.push({ nome: areaNome.value, ruas: [] });
    areaNome.value = '';
    salvarTudo();
    renderMapa();
  };

  window.cadastrarLote = () => {
    const nome = loteNome.value.trim();
    const total = Number(loteTotal.value);
    if (!nome || total <= 0) return;

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
    mapa.innerHTML = '';

    mapaSalvo.forEach((area, a) => {
      const areaDiv = document.createElement('div');
      areaDiv.innerHTML = `<strong>${area.nome}</strong>`;

      area.ruas.forEach((rua, r) => {
        const ruaDiv = document.createElement('div');
        ruaDiv.textContent = `Rua ${rua.nome}`;
        const posDiv = document.createElement('div');

        rua.posicoes.forEach((pos, p) => {
          const d = document.createElement('div');
          d.className = 'posicao';

          if (pos) {
            d.classList.add('ocupada');
            d.style.background = lotesCadastrados[pos.lote]?.cor || '#ccc';
            d.dataset.lote = pos.lote;
            d.dataset.rz = pos.rz;
            d.dataset.volume = pos.volume || '';
          }

          d.onclick = () => abrirModal(a, r, p);
          posDiv.appendChild(d);
        });

        ruaDiv.appendChild(posDiv);
        areaDiv.appendChild(ruaDiv);
      });

      const btnRua = document.createElement('button');
      btnRua.textContent = 'Adicionar Rua';
      btnRua.onclick = () => {
        const nome = prompt('Nome da rua');
        const qtd = Number(prompt('Qtd posições'));
        if (!nome || qtd <= 0) return;
        area.ruas.push({ nome, posicoes: Array(qtd).fill(null) });
        salvarTudo();
        renderMapa();
      };

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
    modalLote.innerHTML = '<option value="">Selecione</option>';
    Object.keys(lotesCadastrados).forEach(l => {
      const o = document.createElement('option');
      o.value = l;
      o.textContent = l;
      modalLote.appendChild(o);
    });
    modal.classList.remove('hidden');
  }

  window.fecharModal = () => modal.classList.add('hidden');

  window.confirmarEndereco = () => {
    const lote = modalLote.value;
    const rz = modalRz.value.trim();
    if (!lote || !rz) return;

    mapaSalvo[posicaoAtual.a]
      .ruas[posicaoAtual.r]
      .posicoes[posicaoAtual.p] = {
        lote,
        rz,
        volume: modalVolume.value.trim()
      };

    salvarTudo();
    fecharModal();
    renderMapa();
  };

  window.removerGaylord = () => {
    mapaSalvo[posicaoAtual.a]
      .ruas[posicaoAtual.r]
      .posicoes[posicaoAtual.p] = null;

    salvarTudo();
    fecharModal();
    renderMapa();
  };

  // =======================
  // DASHBOARD
  // =======================
  function renderDashboard() {
    dashboard.innerHTML = '';
    Object.entries(lotesCadastrados).forEach(([nome, data]) => {
      const div = document.createElement('div');
      div.textContent = `${nome} (${data.total})`;
      dashboard.appendChild(div);
    });
  }

  // =======================
  // HISTÓRICO
  // =======================
  function renderExpedidos() {
    lotesExpedidos.innerHTML = '';
    historicoExpedidos.forEach(h => {
      const d = document.createElement('div');
      d.textContent = h.lote;
      lotesExpedidos.appendChild(d);
    });
  }

  // =======================
  // BUSCA
  // =======================
  window.buscar = () => {
    const t = buscaInput.value.toLowerCase();
    document.querySelectorAll('.posicao').forEach(p => {
      const ok =
        p.dataset.lote?.toLowerCase().includes(t) ||
        p.dataset.rz?.toLowerCase().includes(t) ||
        p.dataset.volume?.toLowerCase().includes(t);
      p.classList.toggle('highlight', ok && t);
    });
  };

  window.limparBusca = () =>
    document.querySelectorAll('.highlight')
      .forEach(p => p.classList.remove('highlight'));

  // =======================
  // INIT
  // =======================
  renderMapa();

});
