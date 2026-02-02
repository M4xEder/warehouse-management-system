window.renderDashboard = function () {
  const dash = document.getElementById('dashboard');
  dash.innerHTML = '';

  state.lotes.forEach(lote => {
    const div = document.createElement('div');
    div.className = 'lote-card';
    div.innerHTML = `
      <strong>${lote.nome}</strong>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${(lote.usados / lote.total) * 100}%; background:${lote.cor}"></div>
      </div>
      <button onclick="expedirLote('${lote.nome}')">Expedir</button>
    `;
    dash.appendChild(div);
  });
};

window.expedirLote = function (nome) {
  const lote = state.lotes.find(l => l.nome === nome);
  if (!lote) return;

  state.historico.push({
    lote: nome,
    data: dataAtual()
  });

  state.lotes = state.lotes.filter(l => l.nome !== nome);
  saveState();
  renderDashboard();
};
