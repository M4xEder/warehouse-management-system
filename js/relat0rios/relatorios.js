// ===============================
// RELATÓRIOS DE EXPEDIÇÃO
// ===============================

let dadosRelatorio = []

document.addEventListener("DOMContentLoaded", async () => {

  await carregarSistema()

  carregarLotesSelect()

})


// ===============================
// CARREGAR LOTES NO SELECT
// ===============================

function carregarLotesSelect(){

  const select = document.getElementById("selectLote")

  select.innerHTML = ""

  const optTodos = document.createElement("option")
  optTodos.value = ""
  optTodos.textContent = "Todos os lotes"

  select.appendChild(optTodos)

  state.lotes.forEach(lote => {

    const opt = document.createElement("option")

    opt.value = lote.id
    opt.textContent = lote.nome

    select.appendChild(opt)

  })

}



// ===============================
// GERAR RELATÓRIO
// ===============================

function gerarRelatorio(){

  const loteSelecionado = document.getElementById("selectLote").value

  const tbody = document.querySelector("#tabelaRelatorio tbody")

  tbody.innerHTML = ""

  dadosRelatorio = []

  state.historicoExpedidos.forEach(item => {

    if(loteSelecionado && item.lote_id != loteSelecionado) return

    const lote = state.lotes.find(l => l.id == item.lote_id)

    const area = state.areas.find(a => a.id == item.area_id)

    const rua = state.ruas.find(r => r.id == item.rua_id)

    const tr = document.createElement("tr")

    tr.innerHTML = `

      <td>${lote?.nome || "-"}</td>
      <td>${item.rz || "-"}</td>
      <td>${item.volume || "-"}</td>
      <td>Expedido</td>
      <td>${area?.nome || "-"}</td>
      <td>${rua?.nome || "-"}</td>
      <td>${formatarData(item.data)}</td>
      <td>${formatarHora(item.data)}</td>

    `

    tbody.appendChild(tr)

    dadosRelatorio.push({

      lote: lote?.nome,
      rz: item.rz,
      volume: item.volume,
      status: "Expedido",
      area: area?.nome,
      rua: rua?.nome,
      data: formatarData(item.data),
      hora: formatarHora(item.data)

    })

  })

  renderResumo()

}



// ===============================
// RESUMO
// ===============================

function renderResumo(){

  const div = document.getElementById("resumo")

  const total = dadosRelatorio.length

  const volumes = dadosRelatorio.reduce((s,v)=>s+(Number(v.volume)||0),0)

  div.style.display = "block"

  div.innerHTML = `
  
  <b>Total expedido:</b> ${total} gaylords
  <br>
  <b>Volume total:</b> ${volumes}
  
  `

}



// ===============================
// EXPORTAR EXCEL DO LOTE
// ===============================

function exportarExcelLote(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const ws = XLSX.utils.json_to_sheet(dadosRelatorio)

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, "Relatorio")

  XLSX.writeFile(wb, "relatorio_lote.xlsx")

}



// ===============================
// EXPORTAR EXCEL GERAL
// ===============================

function exportarExcelGeral(){

  gerarRelatorio()

  exportarExcelLote()

}



// ===============================
// EXPORTAR PDF
// ===============================

function exportarPDF(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const { jsPDF } = window.jspdf

  const doc = new jsPDF()

  const colunas = [
    "Lote",
    "RZ",
    "Volume",
    "Status",
    "Área",
    "Rua",
    "Data",
    "Hora"
  ]

  const linhas = dadosRelatorio.map(r => [

    r.lote,
    r.rz,
    r.volume,
    r.status,
    r.area,
    r.rua,
    r.data,
    r.hora

  ])

  doc.text("Relatório de Expedição", 14, 15)

  doc.autoTable({
    head:[colunas],
    body:linhas,
    startY:20
  })

  doc.save("relatorio_expedicao.pdf")

}



// ===============================
// FORMATAR DATA
// ===============================

function formatarData(data){

  if(!data) return "-"

  const d = new Date(data)

  return d.toLocaleDateString()

}

function formatarHora(data){

  if(!data) return "-"

  const d = new Date(data)

  return d.toLocaleTimeString()

}
