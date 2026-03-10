// =======================================
// RELATORIOS.JS — ENTERPRISE REALTIME
// =======================================

console.log("relatorios.js carregado")

let loteAtualRelatorio = null

document.addEventListener("DOMContentLoaded", async ()=>{

  if(typeof checarSessao === "function"){
    await checarSessao()
  }

  if(typeof carregarSistema === "function"){
    await carregarSistema()
  }

  popularSelectLotes()

})


// ===============================
// POPULAR SELECT
// ===============================
function popularSelectLotes(){

  const select = document.getElementById("selectLote")
  if(!select) return

  select.innerHTML = `<option value="">-- Selecione --</option>`

  const lotes = new Set()

  // MAPA
  state.posicoes.forEach(pos=>{

    if(pos.ocupada && pos.lote_id){

      const lote = getLoteById(pos.lote_id)

      if(lote){
        lotes.add(lote.nome)
      }

    }

  })

  // HISTÓRICO
  state.historico_expedidos.forEach(item=>{

    const lote = getLoteById(item.lote_id)

    if(lote){
      lotes.add(lote.nome)
    }

  })

  Array.from(lotes)
  .sort()
  .forEach(nome=>{

    const opt = document.createElement("option")

    opt.value = nome
    opt.textContent = nome

    select.appendChild(opt)

  })

}



// ===============================
// GERAR RELATÓRIO
// ===============================
window.gerarRelatorio = function(){

  const loteSelecionado =
    document.getElementById("selectLote").value

  if(!loteSelecionado){

    alert("Selecione um lote")
    return

  }

  loteAtualRelatorio = loteSelecionado

  atualizarTabela()

}



// ===============================
// ATUALIZAR TABELA
// ===============================
function atualizarTabela(){

  if(!loteAtualRelatorio) return

  const tbody =
    document.querySelector("#tabelaRelatorio tbody")

  const resumo =
    document.getElementById("resumo")

  tbody.innerHTML = ""
  resumo.style.display = "none"

  const {ativos, expedidos, dados} =
    montarDadosLote(loteAtualRelatorio)

  if(dados.length === 0){

    tbody.innerHTML =
      `<tr><td colspan="8">Nenhum registro encontrado</td></tr>`

    return

  }


  // ===========================
  // TABELA
  // ===========================

  dados.forEach(item=>{

    const tr = document.createElement("tr")

    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.rz}</td>
      <td>${item.volume}</td>
      <td>${item.status}</td>
      <td>${item.area}</td>
      <td>${item.rua}</td>
      <td>${item.data}</td>
      <td>${item.hora}</td>
    `

    tbody.appendChild(tr)

  })


  // ===========================
  // RESUMO
  // ===========================

  const totalGeral = dados.length
  const totalAtivos = ativos.length
  const totalExpedidos = expedidos.length

  const percentualExpedido =
    totalGeral > 0
      ? ((totalExpedidos / totalGeral) * 100).toFixed(1)
      : 0

  resumo.innerHTML = `
    <strong>Lote:</strong> ${loteAtualRelatorio} |
    <strong>Total:</strong> ${totalGeral} |
    <strong>Ativos:</strong> ${totalAtivos} |
    <strong>Expedidos:</strong> ${totalExpedidos} |
    <strong>% expedido:</strong> ${percentualExpedido}%
  `

  resumo.style.display = "block"

}



// ===============================
// MONTAR DADOS
// ===============================
function montarDadosLote(loteNome){

  let ativos = []
  let expedidos = []

  // ATIVOS
  state.posicoes.forEach(pos=>{

    if(pos.ocupada && pos.lote_id){

      const lote = getLoteById(pos.lote_id)

      if(lote && lote.nome === loteNome){

        const rua = getRuaById(pos.rua_id)
        const area = rua ? getAreaById(rua.area_id) : null

        ativos.push({

          nome:lote.nome,
          rz:pos.rz || "-",
          volume:pos.volume || "-",
          status:"ATIVO",
          area:area?.nome || "-",
          rua:rua?.nome || "-",
          data:pos.data || "-",
          hora:pos.hora || "-"

        })

      }

    }

  })


  // EXPEDIDOS
  state.historico_expedidos.forEach(item=>{

    const lote = getLoteById(item.lote_id)

    if(lote && lote.nome === loteNome){

      expedidos.push({

        nome:lote.nome,
        rz:item.rz || "-",
        volume:item.volume || "-",
        status:"EXPEDIDO",
        area:item.area || "-",
        rua:item.rua || "-",
        data:item.data_expedicao || "-",
        hora:item.hora_expedicao || "-"

      })

    }

  })

  return {

    ativos,
    expedidos,
    dados:[...ativos,...expedidos]

  }

}



// =======================================
// AUTO UPDATE COM REALTIME
// =======================================

setInterval(()=>{

  if(!loteAtualRelatorio) return

  atualizarTabela()

},3000)



// ===============================
// EXPORTAR EXCEL LOTE
// ===============================
window.exportarExcelLote = function(){

  if(!loteAtualRelatorio) return

  const {dados} =
    montarDadosLote(loteAtualRelatorio)

  const ws =
    XLSX.utils.json_to_sheet(dados)

  const wb =
    XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    loteAtualRelatorio.substring(0,31)
  )

  XLSX.writeFile(
    wb,
    `relatorio_${loteAtualRelatorio}.xlsx`
  )

}



// ===============================
// EXPORTAR EXCEL GERAL
// ===============================
window.exportarExcelGeral = function(){

  const wb = XLSX.utils.book_new()

  const lotes = new Set()

  state.lotes.forEach(l=>{
    if(l.nome) lotes.add(l.nome)
  })

  Array.from(lotes).forEach(loteNome=>{

    const {dados} =
      montarDadosLote(loteNome)

    if(dados.length > 0){

      const ws =
        XLSX.utils.json_to_sheet(dados)

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        loteNome.substring(0,31)
      )

    }

  })

  XLSX.writeFile(
    wb,
    "relatorio_geral_lotes.xlsx"
  )

}



// ===============================
// EXPORTAR PDF
// ===============================
window.exportarPDF = function(){

  if(!loteAtualRelatorio) return

  const {dados} =
    montarDadosLote(loteAtualRelatorio)

  const {jsPDF} = window.jspdf

  const doc = new jsPDF()

  doc.text(
    `Relatório - ${loteAtualRelatorio}`,
    14,
    15
  )

  const rows = dados.map(item=>[
    item.nome,
    item.rz,
    item.volume,
    item.status,
    item.area,
    item.rua,
    item.data,
    item.hora
  ])

  doc.autoTable({

    startY:22,

    head:[[
      "Lote",
      "RZ",
      "Volume",
      "Status",
      "Área",
      "Rua",
      "Data",
      "Hora"
    ]],

    body:rows

  })

  doc.save(`relatorio_${loteAtualRelatorio}.pdf`)

                             }
