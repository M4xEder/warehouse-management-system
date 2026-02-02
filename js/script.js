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
    return `hsl(${Math.random() * 360},70%,70%)`;
  }

  // =======================
  // CADASTROS
  // =======================
  window.cadastrarArea = () => {
    const nome = areaNome.value.trim();
    if (!nome) return alert('Informe nome da área');
    mapaSalvo.push({ nome, ruas: [] });
    areaNome.value = '';
    salvarTudo();
    renderMapa();
  };

  window.cadastrarLote = () => {
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

  window.alterarQuantidadeLote = (nome) => {
    const alocados = contarGaylordsDoLote(nome);
    const novo = Number(prompt(
      `Nova quantidade para "${nome}" (alocados: ${alocados})`,
      lotesCadastrados[nome].total
    ));
    if (isNaN(novo) || novo < alocados) return alert('Quantidade inválida');
    lotesCadastrados[nome].total = novo;
    salvarTudo();
    renderMapa();
  };

  window.excluirLote = (nome) => {
    if (contarGaylordsDoLote(nome) > 0)
      return alert('Existem gaylords alocadas');
    if (!confirm(`Excluir lote "${nome}"?`)) return;
    delete lotesCadastrados[nome];
    salvarTudo();
    renderMapa();
  };

  // =======================
  // ÁREA / RUA
  // =======================
  window.adicionarRua = (aIndex) => {
    const nome = prompt('Nome da rua');
    const qtd = Number(prompt('Quantidade de posições'));
    if (!nome || qtd <= 0) return;

    mapaSalvo[aIndex].ruas.push({
      nome,
      posicoes: Array(qtd).fill(null)
    });
    salvarTudo();
    renderMapa();
  };

  window.excluirArea = (index) => {
    if (mapaSalvo[index].ruas.some(r => r.posicoes.some(p => p)))
      return alert('Área possui alocações');
    if (!confirm('Excluir área?')) return;
    mapaSalvo.splice(index, 1);
    salvarTudo();
    renderMapa();
  };

  window.excluirRua = (a, r) => {
    if (mapaSalvo[a].ruas[r].posicoes.some(p => p))
      return alert('Rua possui alocações');
    if (!confirm('Excluir rua?')) return;
    mapaSalvo[a].ruas.splice(r, 1);
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
      areaDiv.className = 'area';
      areaDiv.innerHTML = `
        <strong>${area.nome}</strong>
        <button onclick="excluirArea(${a})">Excluir Área</button>
      `;

      area.ruas.forEach((rua, r) => {
        const ruaDiv = document.createElement('div');
        ruaDiv.className = 'rua';
        ruaDiv.innerHTML = `
          Rua ${rua.nome}
          <button onclick="excluirRua(${a},${r})">Excluir Rua</button>
        `;

        const posDiv = document.createElement('div');
        posDiv.className = 'posicoes';

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
      btnRua.onclick = () => adicionarRua(a);
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

    modalLote.innerHTML = '<option value="">Selecione</option>';
    Object.keys(lotesCadastrados).forEach(l => {
      const o = document.createElement('option');
      o.value = l;
      o.textContent = l;
      if (pos?.lote === l) o.selected = true;
      modalLote.appendChild(o);
    });

    modalRz.value = pos?.rz || '';
    modalVolume.value = pos?.volume || '';

    modal.classList.remove('hidden');
  }

  window.fecharModal = () => modal.classList.add('hidden');

  window.confirmarEndereco = () => {
    const lote = modalLote.value;
    const rz = modalRz.value.trim();
    const volume = modalVolume.value.trim() || null;

    if (!lote || !rz) return alert('Lote e RZ obrigatórios');

    mapaSalvo[posicaoAtual.a]
      .ruas[posicaoAtual.r]
      .posicoes[posicaoAtual.p] = { lote, rz, volume };

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
  // DASHBOARD / EXPEDIÇÃO
  // =======================
  function contarGaylordsDoLote(nome) {
    let total = 0;
    mapaSalvo.forEach(a =>
      a.ruas.forEach(r =>
        r.posicoes.forEach(p => {
          if (p?.lote === nome) total++;
        })
      )
    );
    return total;
  }

  function renderDashboard() {
    dashboard.innerHTML = '';
    Object.entries(lotesCadastrados).forEach(([nome, data]) => {
      const usado = contarGaylordsDoLote(nome);
      const perc = (usado / data.total) * 100;

      dashboard.innerHTML += `
        <div class="lote-card">
          <strong>${nome}</strong><br>
          ${usado} / ${data.total}
          <div class="progress-bar">
            <div class="progress-fill" style="width:${perc}%;background:${data.cor}"></div>
          </div>
          <button onclick="alterarQuantidadeLote('${nome}')">Alterar</button>
          <button onclick="excluirLote('${nome}')">Excluir</button>
          <button onclick="expedirLote('${nome}')">Expedir</button>
        </div>
      `;
    });
  }

  window.expedirLote = (nome) => {
    const expedidos = [];

    mapaSalvo.forEach(a =>
      a.ruas.forEach(r =>
        r.posicoes = r.posicoes.map(p => {
          if (p?.lote === nome) {
            expedidos.push({ rz: p.rz, volume: p.volume });
            return null;
          }
          return p;
        })
      )
    );

    if (!expedidos.length) return alert('Nenhuma gaylord');

    historicoExpedidos.push({
      lote: nome,
      expedidos: expedidos.length,
      detalhes: expedidos,
      data: new Date().toLocaleString()
    });

    delete lotesCadastrados[nome];
    salvarTudo();
    renderMapa();
  };

  function renderExpedidos() {
    lotesExpedidos.innerHTML = '';
    historicoExpedidos.forEach((h, i) => {
      lotesExpedidos.innerHTML += `
        <div class="historico-item">
          <strong>${h.lote}</strong> — ${h.expedidos}
          <button onclick="verDetalhes(${i})">Detalhes</button>
        </div>
      `;
    });
  }

  window.verDetalhes = (i) => {
    const d = historicoExpedidos[i].detalhes
      .map((x, n) => `${n + 1} - RZ:${x.rz} Vol:${x.volume || '-'}`)
      .join('\n');
    alert(d);
  };

  // =======================
  // BUSCA
  // =======================
  window.buscar = () => {
    const t = buscaInput.value.toLowerCase();
    document.querySelectorAll('.posicao').forEach(p => {
      const v = `${p.dataset.lote}${p.dataset.rz}${p.dataset.volume}`.toLowerCase();
      p.classList.toggle('highlight', v.includes(t));
    });
  };

  window.limparBusca = () => {
    document.querySelectorAll('.highlight')
      .forEach(p => p.classList.remove('highlight'));
  };

  renderMapa();
});
