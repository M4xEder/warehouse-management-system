// =======================================
// RELATORIOS.JS — SAFE VERSION
// =======================================

console.log("relatorios.js carregado")

let loteAtualRelatorio = null


document.addEventListener("DOMContentLoaded", async ()=>{

  try{

    if(typeof checarSessao === "function"){
      await checarSessao()
    }

    if(typeof carregarSistema === "function"){
      await carregarSistema()
    }

    aguardarState()

  }catch(err){

    console.error("Erro ao carregar sistema:",err)

  }

})



// =======================================
// ESPERAR STATE CARREGAR
// =======================================

function aguardarState(){

  const intervalo = setInterval(()=>{

    if(window.state &&
       state.lotes &&
       state.posicoes &&
       state.historico_expedidos){

      clearInterval(intervalo)

      console.log("State carregado ✔")

      popularSelectLotes()

    }

  },300)

}



// =======================================
// POPULAR SELECT
// =======================================

function popularSelectLotes(){

  const select = document.getElementById("selectLote")

  if(!select) return

  select.innerHTML = `<option value="">-- Selecione --</option>`

  const lotes = new Set()


  if(state.posicoes){

    state.posicoes.forEach(pos=>{

      if(pos.ocupada && pos.lote_id){

        const lote = getLoteById(pos.lote_id)

        if(lote){
          lotes.add(lote.nome)
        }

      }

    })

  }


  if(state.historico_expedidos){

    state.historico_expedidos.forEach(item=>{

      const lote = getLoteById(item.lote_id)

      if(lote){
        lotes.add(lote.nome)
      }

    })

  }


  Array.from(lotes)
  .sort()
  .forEach(nome=>{

    const opt = document.createElement("option")

    opt.value = nome
    opt.textContent = nome

    select.appendChild(opt)

  })

}



// =======================================
// GERAR RELATÓRIO
// =======================================

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



// =======================================
// ATUALIZAR TABELA
// =======================================

function atualizarTabela(){

  if(!loteAtualRelatorio) return
  if(!state) return

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
      `<tr><td colspan="8">Nenhum registro</td></tr>`

    return

  }


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


  const total = dados.length

  resumo.innerHTML =
    `<strong>Lote:</strong> ${loteAtualRelatorio} |
     <strong>Total:</strong> ${total} |
     <strong>Ativos:</strong> ${ativos.length} |
     <strong>Expedidos:</strong> ${expedidos.length}`

  resumo.style.display = "block"

}



// =======================================
// MONTAR DADOS
// =======================================

function montarDadosLote(loteNome){

  let ativos = []
  let expedidos = []

  if(state.posicoes){

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

  }



  if(state.historico_expedidos){

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

  }

  return {

    ativos,
    expedidos,
    dados:[...ativos,...expedidos]

  }

}



// =======================================
// AUTO UPDATE
// =======================================

setInterval(()=>{

  if(loteAtualRelatorio){
    atualizarTabela()
  }

},3000)
