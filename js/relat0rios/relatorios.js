// ======================================
// RELATÓRIOS
// ======================================

let dadosRelatorio = [];

document.addEventListener("DOMContentLoaded", () => {

  esperarSistema();

});


// ======================================
// ESPERA SISTEMA CARREGAR
// ======================================

function esperarSistema(){

  if(state.carregando){
    setTimeout(esperarSistema,200);
    return;
  }

  if(!state.lotes || state.lotes.length === 0){
    console.warn("Nenhum lote encontrado no state");
  }

  carregarLotesSelect();

}



// ======================================
// POPULAR SELECT
// ======================================

function carregarLotesSelect(){

  const select = document.getElementById("selectLote");

  if(!select) return;

  select.innerHTML = "";

  const optTodos = document.createElement("option");
  optTodos.value = "";
  optTodos.textContent = "Todos os lotes";

  select.appendChild(optTodos);

  state.lotes.forEach(lote => {

    const opt = document.createElement("option");

    opt.value = lote.id;
    opt.textContent = lote.nome || lote.lote || `Lote ${lote.id}`;

    select.appendChild(opt);

  });

}



// ======================================
// GERAR RELATÓRIO
// ======================================

function gerarRelatorio(){

  const loteId = document.getElementById("selectLote").value;

  const tbody = document.querySelector("#tabelaRelatorio tbody");

  tbody.innerHTML = "";

  dadosRelatorio = [];

  state.historico_expedidos.forEach(item => {

    if(loteId && !idEquals(item.lote_id, loteId)) return;

    const lote = getLoteById(item.lote_id);
    const area = getAreaById(item.area_id);
    const rua = getRuaById(item.rua_id);

    const data = new Date(item.data || item.created_at);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${lote?.nome || "-"}</td>
      <td>${item.rz || "-"}</td>
      <td>${item.volume || "-"}</td>
      <td>Expedido</td>
      <td>${area?.nome || "-"}</td>
      <td>${rua?.nome || "-"}</td>
      <td>${data.toLocaleDateString()}</td>
      <td>${data.toLocaleTimeString()}</td>
    `;

    tbody.appendChild(tr);

    dadosRelatorio.push({
      lote: lote?.nome,
      rz: item.rz,
      volume: item.volume,
      status: "Expedido",
      area: area?.nome,
      rua: rua?.nome,
      data: data.toLocaleDateString(),
      hora: data.toLocaleTimeString()
    });

  });

  atualizarResumo();

}



// ======================================
// RESUMO
// ======================================

function atualizarResumo(){

  const div = document.getElementById("resumo");

  const total = dadosRelatorio.length;

  const volumeTotal = dadosRelatorio.reduce(
    (s,v)=>s+(Number(v.volume)||0),0
  );

  div.innerHTML = `
  <b>Total expedido:</b> ${total}<br>
  <b>Volume total:</b> ${volumeTotal}
  `;

}



// ======================================
// EXPORTAR EXCEL
// ======================================

function exportarExcelLote(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(dadosRelatorio);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Relatorio");

  XLSX.writeFile(wb,"relatorio_expedicao.xlsx");

}



// ======================================
// EXCEL GERAL
// ======================================

function exportarExcelGeral(){

  gerarRelatorio();

  exportarExcelLote();

}



// ======================================
// PDF
// ======================================

function exportarPDF(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro");
    return;
  }

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const colunas = [
    "Lote","RZ","Volume","Status",
    "Área","Rua","Data","Hora"
  ];

  const linhas = dadosRelatorio.map(r => [
    r.lote,r.rz,r.volume,r.status,
    r.area,r.rua,r.data,r.hora
  ]);

  doc.text("Relatório de Expedição",14,15);

  doc.autoTable({
    head:[colunas],
    body:linhas,
    startY:20
  });

  doc.save("relatorio_expedicao.pdf");

}
