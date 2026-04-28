// ======================================================
// RELATORIOS.JS — FINAL PROFISSIONAL
// ======================================================

let dadosRelatorio = []   // resumo
let dadosDetalhado = []   // detalhado

document.addEventListener("DOMContentLoaded", iniciarRelatorios)

function iniciarRelatorios(){
  esperarSistema()
}

function esperarSistema(){

  if(!window.state || state.carregando){
    setTimeout(esperarSistema,300)
    return
  }

  carregarLotesSelect()
}



// ======================================================
// FORMATAR DATA
// ======================================================
function formatarDataHora(valor){

  if(!valor) return {data:"-",hora:"-"}

  const dataObj = new Date(valor)

  if(isNaN(dataObj.getTime())) return {data:"-",hora:"-"}

  return {
    data:dataObj.toLocaleDateString("pt-BR"),
    hora:dataObj.toLocaleTimeString("pt-BR")
  }

}



// ======================================================
// SELECT LOTES (SEM AUTO EXECUÇÃO)
// ======================================================
function carregarLotesSelect(){

  const select = document.getElementById("selectLote")

  if(!select) return

  select.innerHTML = '<option value="">Todos os lotes</option>'

  state.lotes.forEach(lote => {

    const opt = document.createElement("option")

    opt.value = lote.id
    opt.textContent = lote.nome || lote.codigo || lote.id

    select.appendChild(opt)

  })

}



// ======================================================
// GERAR RELATÓRIO (BOTÃO)
// ======================================================
function gerarRelatorio(){

  gerarRelatorioDetalhado()
  gerarResumoEndereco()

}



// ======================================================
// RELATÓRIO DETALHADO
// ======================================================
function gerarRelatorioDetalhado(){

  const loteFiltro = document.getElementById("selectLote").value
  const tbody = document.querySelector("#tabelaDetalhada tbody")

  if(!tbody) return

  tbody.innerHTML = ""
  dadosDetalhado = []

  let encontrou = false


  // ================= ALOCADOS =================
  state.posicoes.forEach(p=>{

    if(!p.ocupada) return
    if(loteFiltro && !idEquals(p.lote_id,loteFiltro)) return

    const lote = getLoteById(p.lote_id)
    const rua = getRuaById(p.rua_id)
    if(!rua) return

    const area = getAreaById(rua.area_id)

    const registro = {
      Lote: lote?.nome || "-",
      RZ: p.rz || "-",
      Volume: p.volume || "-",
      Área: area?.nome || "-",
      Rua: rua?.nome || "-",
      Status: "ALOCADO",
      Data: "-",
      Hora: "-"
    }

    dadosDetalhado.push(registro)

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${registro.Lote}</td>
      <td>${registro.RZ}</td>
      <td>${registro.Volume}</td>
      <td>${registro.Área}</td>
      <td>${registro.Rua}</td>
      <td>${registro.Status}</td>
      <td>${registro.Data}</td>
      <td>${registro.Hora}</td>
    `
    tbody.appendChild(tr)

    encontrou = true

  })


  // ================= EXPEDIDOS =================
  state.historico_expedidos.forEach(h=>{

    if(loteFiltro && !idEquals(h.lote_id,loteFiltro)) return

    const lote = getLoteById(h.lote_id)
    const rua = getRuaById(h.rua_id)
    const area = getAreaById(h.area_id)

    const dh = formatarDataHora(h.data || h.created_at)

    const registro = {
      Lote: lote?.nome || "-",
      RZ: h.rz || "-",
      Volume: h.volume || "-",
      Área: area?.nome || "-",
      Rua: rua?.nome || "-",
      Status: "EXPEDIDO",
      Data: dh.data,
      Hora: dh.hora
    }

    dadosDetalhado.push(registro)

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${registro.Lote}</td>
      <td>${registro.RZ}</td>
      <td>${registro.Volume}</td>
      <td>${registro.Área}</td>
      <td>${registro.Rua}</td>
      <td>${registro.Status}</td>
      <td>${registro.Data}</td>
      <td>${registro.Hora}</td>
    `
    tbody.appendChild(tr)

    encontrou = true

  })


  // ================= SEM DADOS =================
  if(!encontrou){

    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="padding:20px;font-weight:bold;color:#666;">
          Nenhum dado encontrado para o filtro selecionado
        </td>
      </tr>
    `
  }

}



// ======================================================
// RESUMO POR ENDEREÇO
// ======================================================
function gerarResumoEndereco(){

  const loteFiltro = document.getElementById("selectLote").value
  const tbody = document.querySelector("#tabelaRelatorio tbody")

  if(!tbody) return

  tbody.innerHTML = ""
  dadosRelatorio = []

  const agrupado = {}

  state.posicoes.forEach(p => {

    if(!p.ocupada) return
    if(loteFiltro && !idEquals(p.lote_id,loteFiltro)) return

    const lote = getLoteById(p.lote_id)
    const rua = getRuaById(p.rua_id)
    const area = getAreaById(rua.area_id)

    if(!lote || !rua || !area) return

    const chave = `${lote.id}_${area.id}_${rua.id}`

    if(!agrupado[chave]){
      agrupado[chave] = {
        Lote:lote.nome,
        Área:area.nome,
        Rua:rua.nome,
        Gaylords:0
      }
    }

    agrupado[chave].Gaylords++

  })


  Object.values(agrupado).forEach(item=>{

    dadosRelatorio.push(item)

    const tr = document.createElement("tr")
    tr.innerHTML = `
      <td>${item.Lote}</td>
      <td>${item.Área}</td>
      <td>${item.Rua}</td>
      <td>${item.Gaylords}</td>
    `
    tbody.appendChild(tr)

  })


  // ================= SEM DADOS =================
  if(dadosRelatorio.length === 0){

    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="padding:20px;font-weight:bold;color:#666;">
          Nenhum endereço encontrado
        </td>
      </tr>
    `
  }

}



// ======================================================
// EXCEL (2 ABAS)
// ======================================================
function exportarExcelCompleto(){

  if(!dadosDetalhado.length && !dadosRelatorio.length){
    alert("Gere o relatório primeiro")
    return
  }

  const wb = XLSX.utils.book_new()

  if(dadosDetalhado.length){
    const ws1 = XLSX.utils.json_to_sheet(dadosDetalhado)
    XLSX.utils.book_append_sheet(wb, ws1, "Detalhado")
  }

  if(dadosRelatorio.length){
    const ws2 = XLSX.utils.json_to_sheet(dadosRelatorio)
    XLSX.utils.book_append_sheet(wb, ws2, "Resumo")
  }

  XLSX.writeFile(wb, "relatorio_completo.xlsx")

}



// ======================================================
// PDF (DETALHADO)
// ======================================================
function exportarPDF(){

  if(!dadosDetalhado.length){
    alert("Gere o relatório primeiro")
    return
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF()

  const colunas = ["Lote","RZ","Volume","Área","Rua","Status","Data","Hora"]

  const linhas = dadosDetalhado.map(r => [
    r.Lote, r.RZ, r.Volume, r.Área, r.Rua, r.Status, r.Data, r.Hora
  ])

  doc.text("Relatório Detalhado",14,15)

  doc.autoTable({
    head:[colunas],
    body:linhas,
    startY:20
  })

  doc.save("relatorio_detalhado.pdf")

}
