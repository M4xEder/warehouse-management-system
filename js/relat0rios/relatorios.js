// ===============================
// RELATÓRIOS
// ===============================

let dadosRelatorio = []

document.addEventListener("DOMContentLoaded", iniciarRelatorios)

async function iniciarRelatorios(){

  try{

    // carrega banco e state
    await carregarSistema()

    console.log("Sistema carregado")
    console.log("Lotes:", state.lotes)

    carregarLotesSelect()

  }catch(e){

    console.error("Erro ao iniciar relatórios", e)

  }

}


// ===============================
// POPULAR SELECT LOTES
// ===============================

function carregarLotesSelect(){

  const select = document.getElementById("selectLote")

  if(!select){
    console.error("Select de lotes não encontrado")
    return
  }

  select.innerHTML = ""

  // opção todos
  const optTodos = document.createElement("option")
  optTodos.value = ""
  optTodos.textContent = "Todos os lotes"

  select.appendChild(optTodos)

  if(!state.lotes || state.lotes.length === 0){

    console.warn("Nenhum lote encontrado no state")

    const opt = document.createElement("option")
    opt.textContent = "Nenhum lote encontrado"
    opt.disabled = true

    select.appendChild(opt)

    return
  }

  state.lotes.forEach(lote => {

    const opt = document.createElement("option")

    opt.value = lote.id

    // tenta nome ou lote
    opt.textContent = lote.nome || lote.lote || `Lote ${lote.id}`

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

  if(!state.historicoExpedidos){

    console.warn("Histórico vazio")

    return
  }

  state.historicoExpedidos.forEach(item => {

    if(loteSelecionado && item.lote_id != loteSelecionado) return

    const lote = state.lotes.find(l => l.id == item.lote_id)

    const area = state.areas.find(a => a.id == item.area_id)

    const rua = state.ruas.find(r => r.id == item.rua_id)

    const tr = document.createElement("tr")

    const data = new Date(item.data)

    tr.innerHTML = `
      <td>${lote?.nome || "-"}</td>
      <td>${item.rz || "-"}</td>
      <td>${item.volume || "-"}</td>
      <td>Expedido</td>
      <td>${area?.nome || "-"}</td>
      <td>${rua?.nome || "-"}</td>
      <td>${data.toLocaleDateString()}</td>
      <td>${data.toLocaleTimeString()}</td>
    `

    tbody.appendChild(tr)

    dadosRelatorio.push({

      lote: lote?.nome,
      rz: item.rz,
      volume: item.volume,
      status: "Expedido",
      area: area?.nome,
      rua: rua?.nome,
      data: data.toLocaleDateString(),
      hora: data.toLocaleTimeString()

    })

  })

  atualizarResumo()

}



// ===============================
// RESUMO
// ===============================

function atualizarResumo(){

  const div = document.getElementById("resumo")

  if(!dadosRelatorio.length){

    div.innerHTML = "Nenhum registro encontrado"

    return
  }

  const total = dadosRelatorio.length

  const volumes = dadosRelatorio.reduce((s,v)=>s+(Number(v.volume)||0),0)

  div.innerHTML = `
  
  <b>Total expedido:</b> ${total}<br>
  <b>Volume total:</b> ${volumes}
  
  `

}



// ===============================
// EXPORTAR EXCEL
// ===============================

function exportarExcelLote(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const ws = XLSX.utils.json_to_sheet(dadosRelatorio)

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, "Relatorio")

  XLSX.writeFile(wb,"relatorio_expedicao.xlsx")

}



// ===============================
// EXCEL GERAL
// ===============================

function exportarExcelGeral(){

  gerarRelatorio()

  exportarExcelLote()

}



// ===============================
// PDF
// ===============================

function exportarPDF(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const { jsPDF } = window.jspdf

  const doc = new jsPDF()

  const colunas = [
    "Lote","RZ","Volume","Status","Área","Rua","Data","Hora"
  ]

  const linhas = dadosRelatorio.map(r => [
    r.lote,r.rz,r.volume,r.status,r.area,r.rua,r.data,r.hora
  ])

  doc.text("Relatório de Expedição",14,15)

  doc.autoTable({
    head:[colunas],
    body:linhas,
    startY:20
  })

  doc.save("relatorio_expedicao.pdf")

}
