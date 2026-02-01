/* =====================
   DADOS
===================== */
const mapa = JSON.parse(localStorage.getItem('mapa')) || [];
const lotes = JSON.parse(localStorage.getItem('lotes')) || {};
const historicoExpedidos = JSON.parse(localStorage.getItem('historicoExpedidos')) || [];

const select = document.getElementById('loteSelecionado');
const tabela = document.getElementById('tabela');
const resumo = document.getElementById('resumo');
const mensagem = document.getElementById('mensagem');

/* =====================
   CARREGAR LOTES
===================== */
(function carregarLotes() {
  const set = new Set();

  Object.keys(lotes).forEach(l => set.add(l));
  historicoExpedidos.forEach(h => set.add(h.lote));

  select.innerHTML = '<option value="">Selecione</option>';

  set.forEach(lote => {
    const opt = document.createElement('option');
    opt.value = lote;
    opt.textContent = lote;
    select.appendChild(opt);
  });
})();

/* =====================
   GERAR RELATÓRIO
===================== */
function gerarRelatorio() {
  const lote = select.value;
  if (!lote) return alert('Selecione um lote');

  tabela.innerHTML = '';
  resumo.innerHTML = '';
  mensagem.style.display = 'none';
  mensagem.innerHTML = '';

  let total = 0;
  let expedidos = 0;
  let alocados = 0;

  const historico = historicoExpedidos.filter(h => h.lote === lote);

  if (historico.length > 0) total = historico[0].totalOriginal;
  else if (lotes[lote]) total = lotes[lote].total;

  // EXPEDIDOS
  historico.forEach(h => {
    expedidos += h.expedidos;

    h.detalhes.forEach(d => {
      tabela.innerHTML += `
        <tr>
          <td class="expedido">Expedida</td>
          <td>-</td><td>-</td><td>-</td>
          <td>${d.rz}</td>
          <td>${d.volume || '-'}</td>
        </tr>`;
    });

    if (h.expedidos < h.totalOriginal) {
      mensagem.style.display = 'block';
      mensagem.innerHTML += `
        ⚠️ Expedição parcial do lote <strong>${lote}</strong><br>
        Total: ${h.totalOriginal} | Expedidas: ${h.expedidos}<br><br>
      `;
    }
  });

  // ALOCADAS
  mapa.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, i) => {
        if (pos?.lote !== lote) return;
        alocados++;

        tabela.innerHTML += `
          <tr>
            <td class="ativo">Alocada</td>
            <td>${area.nome}</td>
            <td>${rua.nome}</td>
            <td>${i + 1}</td>
            <td>${pos.rz}</td>
            <td>${pos.volume || '-'}</td>
          </tr>`;
      });
    });
  });

  const naoAlocadas = Math.max(total - expedidos - alocados, 0);

  if (naoAlocadas > 0) {
    mensagem.style.display = 'block';
    mensagem.innerHTML += `
      ℹ️ ${naoAlocadas} gaylords não foram alocadas
      (sem RZ e sem Volume)
    `;
  }

  resumo.innerHTML = `
    <div class="card">Total: ${total}</div>
    <div class="card">Expedidas: ${expedidos}</div>
    <div class="card">Alocadas: ${alocados}</div>
    <div class="card">Não alocadas: ${naoAlocadas}</div>
  `;
}

/* =====================
   GERAR DADOS DO LOTE
===================== */
function gerarDadosLote(lote) {
  let dados = [];
  let total = 0;
  let expedidos = 0;
  let alocados = 0;

  const historico = historicoExpedidos.filter(h => h.lote === lote);

  if (historico.length > 0) total = historico[0].totalOriginal;
  else if (lotes[lote]) total = lotes[lote].total;

  historico.forEach(h => {
    expedidos += h.expedidos;
    h.detalhes.forEach(d => {
      dados.push({
        Lote: lote,
        Status: 'Expedida',
        RZ: d.rz,
        Volume: d.volume || ''
      });
    });
  });

  mapa.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos?.lote === lote) {
          alocados++;
          dados.push({
            Lote: lote,
            Status: 'Alocada',
            RZ: pos.rz,
            Volume: pos.volume || ''
          });
        }
      });
    });
  });

  const naoAlocadas = Math.max(total - expedidos - alocados, 0);
  for (let i = 0; i < naoAlocadas; i++) {
    dados.push({
      Lote: lote,
      Status: 'Não alocada',
      RZ: '',
      Volume: ''
    });
  }

  return dados;
}

/* =====================
   EXPORTAÇÕES
===================== */
function exportarExcelLote() {
  const lote = select.value;
  if (!lote) return alert('Selecione um lote');

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(gerarDadosLote(lote));
  XLSX.utils.book_append_sheet(wb, ws, `Lote_${lote}`.substring(0, 31));
  XLSX.writeFile(wb, `relatorio_${lote}.xlsx`);
}

function exportarExcelTodos() {
  const wb = XLSX.utils.book_new();
  const set = new Set();

  Object.keys(lotes).forEach(l => set.add(l));
  historicoExpedidos.forEach(h => set.add(h.lote));

  set.forEach(lote => {
    const dados = gerarDadosLote(lote);
    if (dados.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, `Lote_${lote}`.substring(0, 31));
  });

  XLSX.writeFile(wb, 'relatorio_todos_lotes.xlsx');
}

function exportarCSVLote() {
  const lote = select.value;
  if (!lote) return alert('Selecione um lote');
  gerarCSV(gerarDadosLote(lote), `relatorio_${lote}.csv`);
}

function exportarCSVTodos() {
  const set = new Set();
  Object.keys(lotes).forEach(l => set.add(l));
  historicoExpedidos.forEach(h => set.add(h.lote));

  let dados = [];
  set.forEach(lote => dados = dados.concat(gerarDadosLote(lote)));

  gerarCSV(dados, 'relatorio_todos_lotes.csv');
}

function gerarCSV(dados, nome) {
  let csv = Object.keys(dados[0]).join(',') + '\n';
  dados.forEach(l => {
    csv += Object.values(l).map(v => `"${v}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nome;
  link.click();
}
