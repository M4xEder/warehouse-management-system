// =======================================
// RELATORIOS.JS — RELATÓRIOS E EXPORTAÇÃO
// =======================================

console.log('relatorios.js carregado');

// -------------------------------
// POPULAR SELECT COM LOTES
// -------------------------------
function popularSelectLotes() {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select) return;

  select.innerHTML = '<option value="">Selecione um lote</option>';

  const lotes = state.lotes || [];
  lotes.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.nome;
    opt.textContent = l.nome;
    select.appendChild(opt);
  });
}

// Chamada inicial
popularSelectLotes();

// -------------------------------
// CONTAR PARCIAIS ANTES
// -------------------------------
function contarParciaisAntes(expAtual) {
  return state.historicoExpedidos.filter(exp =>
    exp.lote === expAtual.lote &&
    exp.tipo === 'PARCIAL' &&
    new Date(`${exp.data} ${exp.hora}`) <
    new Date(`${expAtual.data} ${expAtual.hora}`)
  ).length;
}

// -------------------------------
// EXPORTAR RELATÓRIO EXCEL - TODOS LOTES
// -------------------------------
window.exportarRelatorioExcel = function () {
  if (!state.lotes || state.lotes.length === 0) {
    alert('Nenhum lote cadastrado para exportação.');
    return;
  }

  const wb = XLSX.utils.book_new();

  state.lotes.forEach(lote => {
    const dados = [];

    const total = lote.total;
    const alocadas = [];
    const expedidas = [];

    // Gaylords alocadas no mapa
    state.areas.forEach(area => {
      area.ruas.forEach(rua => {
        rua.posicoes.forEach(pos => {
          if (pos.ocupada && pos.lote === lote.nome) {
            alocadas.push({
              Área: area.nome,
              Rua: rua.nome,
              Posição: pos.posicao,
              RZ: pos.rz || '',
              Volume: pos.volume || ''
            });
          }
        });
      });
    });

    // Gaylords expedidas
    state.historicoExpedidos.forEach(exp => {
      if (exp.lote === lote.nome) {
        exp.detalhes.forEach(d => {
          expedidas.push({
            Data: exp.data,
            Hora: exp.hora,
            Área: d.area,
            Rua: d.rua,
            Posição: d.posicao,
            RZ: d.rz || '',
            Volume: d.volume || ''
          });
        });
      }
    });

    // Montar planilha
    dados.push(['Total do Lote', total]);
    dados.push([]);
    dados.push(['Alocadas']);
    if (alocadas.length > 0) {
      dados.push(Object.keys(alocadas[0]));
      alocadas.forEach(a => {
        dados.push(Object.values(a));
      });
    } else {
      dados.push(['Nenhuma alocada']);
    }

    dados.push([]);
    dados.push(['Expedidas']);
    if (expedidas.length > 0) {
      dados.push(Object.keys(expedidas[0]));
      expedidas.forEach(e => {
        dados.push(Object.values(e));
      });
    } else {
      dados.push(['Nenhuma expedida']);
    }

    const naoAlocadas = total - alocadas.length - expedidas.length;
    dados.push([]);
    dados.push(['Não alocadas', naoAlocadas]);

    // Mensagem parcial
    const qtdParciais = state.historicoExpedidos.filter(
      e => e.lote === lote.nome && e.tipo === 'PARCIAL'
    ).length;
    if (qtdParciais > 0) {
      dados.push([]);
      dados.push([`🧾 Este lote teve ${qtdParciais} expedição${qtdParciais>1?'s':''} parcial${qtdParciais>1?'s':''} antes da final.`]);
    }

    const ws = XLSX.utils.aoa_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, lote.nome);
  });

  XLSX.writeFile(wb, `relatorio_lotes_${Date.now()}.xlsx`);
};

// -------------------------------
// EXPORTAR RELATÓRIO EXCEL - LOTE ESPECÍFICO
// -------------------------------
window.exportarRelatorioLote = function () {
  const select = document.getElementById('selectLoteRelatorio');
  if (!select || !select.value) {
    return alert('Selecione um lote para exportar');
  }

  const lote = state.lotes.find(l => l.nome === select.value);
  if (!lote) return alert('Lote não encontrado');

  const wb = XLSX.utils.book_new();
  const dados = [];

  const total = lote.total;
  const alocadas = [];
  const expedidas = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === lote.nome) {
          alocadas.push({
            Área: area.nome,
            Rua: rua.nome,
            Posição: pos.posicao,
            RZ: pos.rz || '',
            Volume: pos.volume || ''
          });
        }
      });
    });
  });

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === lote.nome) {
      exp.detalhes.forEach(d => {
        expedidas.push({
          Data: exp.data,
          Hora: exp.hora,
          Área: d.area,
          Rua: d.rua,
          Posição: d.posicao,
          RZ: d.rz || '',
          Volume: d.volume || ''
        });
      });
    }
  });

  dados.push(['Total do Lote', total]);
  dados.push([]);
  dados.push(['Alocadas']);
  if (alocadas.length > 0) {
    dados.push(Object.keys(alocadas[0]));
    alocadas.forEach(a => dados.push(Object.values(a)));
  } else {
    dados.push(['Nenhuma alocada']);
  }

  dados.push([]);
  dados.push(['Expedidas']);
  if (expedidas.length > 0) {
    dados.push(Object.keys(expedidas[0]));
    expedidas.forEach(e => dados.push(Object.values(e)));
  } else {
    dados.push(['Nenhuma expedida']);
  }

  const naoAlocadas = total - alocadas.length - expedidas.length;
  dados.push([]);
  dados.push(['Não alocadas', naoAlocadas]);

  const qtdParciais = state.historicoExpedidos.filter(
    e => e.lote === lote.nome && e.tipo === 'PARCIAL'
  ).length;
  if (qtdParciais > 0) {
    dados.push([]);
    dados.push([`🧾 Este lote teve ${qtdParciais} expedição${qtdParciais>1?'s':''} parcial${qtdParciais>1?'s':''} antes da final.`]);
  }

  const ws = XLSX.utils.aoa_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, lote.nome);
  XLSX.writeFile(wb, `relatorio_${lote.nome}_${Date.now()}.xlsx`);
};

// -------------------------------
// FILTRO POR RZ
// -------------------------------
window.filtrarPorRz = function () {
  const rz = document.getElementById('filtroRz').value.trim();
  const resultado = document.getElementById('resultadoRz');
  if (!rz || !resultado) return;

  resultado.innerHTML = '';

  const encontrados = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.rz && pos.rz.includes(rz)) {
          encontrados.push({
            Lote: pos.lote,
            Área: area.nome,
            Rua: rua.nome,
            Posição: pos.posicao,
            RZ: pos.rz,
            Volume: pos.volume || ''
          });
        }
      });
    });
  });

  if (encontrados.length === 0) {
    resultado.innerHTML = '<p>Nenhum registro encontrado</p>';
    return;
  }

  let html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;"><tr><th>Lote</th><th>Área</th><th>Rua</th><th>Posição</th><th>RZ</th><th>Volume</th></tr>';
  encontrados.forEach(r => {
    html += `<tr>
      <td>${r.Lote}</td>
      <td>${r.Área}</td>
      <td>${r.Rua}</td>
      <td>${r.Posição}</td>
      <td>${r.RZ}</td>
      <td>${r.Volume}</td>
    </tr>`;
  });
  html += '</table>';

  resultado.innerHTML = html;
};
