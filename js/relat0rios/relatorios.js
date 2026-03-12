// ======================================================
// RELATORIOS.JS
// Relatórios de Armazém
// ======================================================

let dadosRelatorio = []

document.addEventListener("DOMContentLoaded", iniciarRelatorios)


// ======================================
// ESPERA SISTEMA CARREGAR
// ======================================

function iniciarRelatorios(){

  esperarSistema()

}

function esperarSistema(){

  if(state.carregando){
    setTimeout(esperarSistema,200)
    return
  }

  carregarLotesSelect()

}


// ======================================
// SELECT DE LOTES
// ======================================

function carregarLotesSelect(){

  const select = document.getElementById("selectLote")

  if(!select) return

  select.innerHTML = ""

  const optTodos = document.createElement("option")
  optTodos.value = ""
  optTodos.textContent = "Todos os lotes"

  select.appendChild(optTodos)

  state.lotes.forEach(lote => {

    const opt = document.createElement("option")

    opt.value = lote.id
    opt.textContent = lote.nome || lote.lote || lote.id

    select.appendChild(opt)

  })

}


// ======================================
// GERAR RELATÓRIO
// ======================================

function gerarRelatorio(){

  const loteId = document.getElementById("selectLote").value

  const tbody = document.querySelector("#tabelaRelatorio tbody")

  tbody.innerHTML = ""

  dadosRelatorio = []



  // ==============================
  // LOTES EM PISO
  // ==============================

  const emPiso = {}

  state.posicoes.forEach(p => {

    if(!p.ocupada) return

    if(loteId && !idEquals(p.lote_id,loteId)) return

    const lote = getLoteById(p.lote_id)

    if(!lote) return

    const nome = lote.nome || lote.id

    if(!emPiso[nome]){
      emPiso[nome] = 0
    }

    emPiso[nome]++

  })



  // ==============================
  // LOTES EXPEDIDOS
  // ==============================

  const expedidos = {}

  state.historico_expedidos.forEach(h => {

    if(loteId && !idEquals(h.lote_id,loteId)) return

    const lote = getLoteById(h.lote_id)

    if(!lote) return

    const nome = lote.nome || lote.id

    if(!expedidos[nome]){
      expedidos[nome] = 0
    }

    expedidos[nome] += (h.quantidade || 1)

  })



  // ==============================
  // JUNTAR DADOS
  // ==============================

  const todosLotes = new Set([
    ...Object.keys(emPiso),
    ...Object.keys(expedidos)
  ])



  todosLotes.forEach(nome => {

    const piso = emPiso[nome] || 0
    const exp = expedidos[nome] || 0
    const total = piso + exp

    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td>${nome}</td>
      <td>${piso}</td>
      <td>${exp}</td>
      <td>${total}</td>
    `

    tbody.appendChild(tr)

    dadosRelatorio.push({
      lote:nome,
      em_piso:piso,
      expedidos:exp,
      total:total
    })

  })


  atualizarResumo()

}


// ======================================
// RESUMO
// ======================================

function atualizarResumo(){

  const div = document.getElementById("resumo")

  const totalPiso = dadosRelatorio.reduce(
    (s,v)=>s+v.em_piso,0
  )

  const totalExp = dadosRelatorio.reduce(
    (s,v)=>s+v.expedidos,0
  )

  div.innerHTML = `
  <b>Gaylords no Armazém:</b> ${totalPiso}<br>
  <b>Gaylords Expedidos:</b> ${totalExp}<br>
  <b>Total Geral:</b> ${totalPiso + totalExp}
  `

}



// ======================================
// EXPORTAR EXCEL
// ======================================

function exportarExcelLote(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const ws = XLSX.utils.json_to_sheet(dadosRelatorio)

  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, "Relatorio")

  XLSX.writeFile(wb,"relatorio_armazem.xlsx")

}



// ======================================
// EXCEL GERAL
// ======================================

function exportarExcelGeral(){

  gerarRelatorio()

  exportarExcelLote()

}



// ======================================
// EXPORTAR PDF
// ======================================

function exportarPDF(){

  if(!dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const { jsPDF } = window.jspdf

  const doc = new jsPDF()

  const colunas = [
    "Lote",
    "Em Piso",
    "Expedidos",
    "Total"
  ]

  const linhas = dadosRelatorio.map(r => [
    r.lote,
    r.em_piso,
    r.expedidos,
    r.total
  ])

  doc.text("Relatório de Armazém",14,15)

  doc.autoTable({
    head:[colunas],
    body:linhas,
    startY:20
  })

  doc.save("relatorio_armazem.pdf")

    }
