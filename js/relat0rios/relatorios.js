// ======================================================
// RELATORIOS.JS
// Relatório de localização dos lotes
// ======================================================

let dadosRelatorio = []

document.addEventListener("DOMContentLoaded", iniciarRelatorios)

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



// ======================================================
// FORMATA DATA E HORA (CORREÇÃO INVALID DATE)
// ======================================================

function formatarDataHora(valor){

if(!valor) return {data:"-",hora:"-"}

try{

const dataObj = new Date(valor)

if(!isNaN(dataObj)){
return {
data:dataObj.toLocaleDateString("pt-BR"),
hora:dataObj.toLocaleTimeString("pt-BR")
}
}

return {data:"-",hora:"-"}

}catch{
return {data:"-",hora:"-"}
}

}



// ======================================================
// SELECT LOTES
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
// GERAR RELATÓRIO
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

let encontrou = false



// ===============================
// GAYLORDS ALOCADOS
// ===============================

state.posicoes.forEach(p=>{

if(!p.ocupada) return
if(loteFiltro && !idEquals(p.lote_id,loteFiltro)) return

const lote = getLoteById(p.lote_id)
const rua = getRuaById(p.rua_id)

if(!rua) return

const area = getAreaById(rua.area_id)

const tr = document.createElement("tr")

tr.innerHTML = `
<td>${lote?.nome || "-"}</td>
<td>${p.rz || "-"}</td>
<td>${p.volume || "-"}</td>
<td>${area?.nome || "-"}</td>
<td>${rua?.nome || "-"}</td>
<td>ALOCADO</td>
<td>-</td>
<td>-</td>
`

tbody.appendChild(tr)

encontrou = true

})



// ===============================
// GAYLORDS EXPEDIDOS
// ===============================

if(state.historico_expedidos){

state.historico_expedidos.forEach(h=>{

if(loteFiltro && !idEquals(h.lote_id,loteFiltro)) return

const lote = getLoteById(h.lote_id)
const rua = getRuaById(h.rua_id)
const area = getAreaById(h.area_id)

// aceita data ou created_at
const dataHora = formatarDataHora(h.data || h.created_at)

const tr = document.createElement("tr")

tr.innerHTML = `
<td>${lote?.nome || "-"}</td>
<td>${h.rz || "-"}</td>
<td>${h.volume || "-"}</td>
<td>${area?.nome || "-"}</td>
<td>${rua?.nome || "-"}</td>
<td>EXPEDIDO</td>
<td>${dataHora.data}</td>
<td>${dataHora.hora}</td>
`

tbody.appendChild(tr)

encontrou = true

})

}



if(!encontrou){

tbody.innerHTML = `
<tr>
<td colspan="8">Nenhum registro encontrado</td>
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

if(!lote || !rua) return

const area = getAreaById(rua.area_id)

if(!area) return

const loteNome = lote.nome || lote.codigo || lote.id
const areaNome = area.nome || area.codigo || area.id
const ruaNome = rua.nome || rua.codigo || rua.id

const chave = `${loteNome}_${areaNome}_${ruaNome}`

if(!agrupado[chave]){

agrupado[chave] = {
lote:loteNome,
area:areaNome,
rua:ruaNome,
quantidade:0
}

}

agrupado[chave].quantidade++

})



Object.values(agrupado).forEach(item => {

const tr = document.createElement("tr")

tr.innerHTML = `
<td>${item.lote}</td>
<td>${item.area}</td>
<td>${item.rua}</td>
<td>${item.quantidade}</td>
`

tbody.appendChild(tr)

dadosRelatorio.push(item)

})



if(dadosRelatorio.length === 0){

tbody.innerHTML = `
<tr>
<td colspan="4">Nenhum endereço encontrado</td>
</tr>
`

}

atualizarResumo()

}



// ======================================================
// RESUMO TOTAL
// ======================================================

function atualizarResumo(){

const div = document.getElementById("resumo")

const total = dadosRelatorio.reduce((s,v)=>s+v.quantidade,0)

div.innerHTML = `
Total de Gaylords no Armazém: <b>${total}</b>
`

}



// ======================================================
// EXPORTAR EXCEL
// ======================================================

function exportarExcelLote(){

if(!dadosRelatorio.length){
alert("Gere o relatório primeiro")
return
}

const ws = XLSX.utils.json_to_sheet(dadosRelatorio)
const wb = XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb,ws,"Relatorio")

XLSX.writeFile(wb,"relatorio_armazem.xlsx")

}



// ======================================================
// EXPORTAR PDF
// ======================================================

function exportarPDF(){

if(!dadosRelatorio.length){
alert("Gere o relatório primeiro")
return
}

const { jsPDF } = window.jspdf

const doc = new jsPDF()

const colunas = ["Lote","Área","Rua","Gaylords"]

const linhas = dadosRelatorio.map(r => [
r.lote,
r.area,
r.rua,
r.quantidade
])

doc.text("Relatório de Armazém",14,15)

doc.autoTable({
head:[colunas],
body:linhas,
startY:20
})

doc.save("relatorio_armazem.pdf")

}
