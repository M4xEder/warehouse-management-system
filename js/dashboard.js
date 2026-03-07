// ==============================================
// DASHBOARD.JS — CONTROLE DE LOTES
// ==============================================



// ------------------------------------------------
// CONTAR POSIÇÕES ALOCADAS NO MAPA
// ------------------------------------------------
function contarAlocados(loteId){

  if(!state?.posicoes) return 0

  return state.posicoes.filter(p =>
    p.ocupada === true &&
    String(p.lote_id) === String(loteId)
  ).length

}



// ------------------------------------------------
// CONTAR EXPEDIDOS
// ------------------------------------------------
function contarExpedidos(loteId){

  if(!state?.historicoExpedidos) return 0

  return state.historicoExpedidos
    .filter(e => String(e.lote_id) === String(loteId))
    .reduce((soma,e)=> soma + (Number(e.quantidade)||0),0)

}



// ------------------------------------------------
// RENDER DASHBOARD DOS LOTES
// ------------------------------------------------
window.renderDashboard = function(){

  const containerAtivos = document.getElementById("lotesAtivos")
  const containerExpedidos = document.getElementById("lotesExpedidos")

  if(!containerAtivos || !containerExpedidos) return

  containerAtivos.innerHTML = ""
  containerExpedidos.innerHTML = ""

  if(!state?.lotes) return



  state.lotes.forEach(lote=>{

    // TOTAL DO LOTE (FIXO)
    const total = Number(lote.quantidade || lote.volume_total || 0)

    const alocados = contarAlocados(lote.id)

    const expedidos = contarExpedidos(lote.id)

    const naoAlocados = Math.max(0,total - alocados)

    const saldoDisponivel = Math.max(0,total - expedidos)



    // STATUS
    let status = "Ativo"

    if(saldoDisponivel === 0){
      status = "Finalizado"
    }
    else if(expedidos > 0){
      status = "Parcial"
    }



    const card = document.createElement("div")

    card.className = "lote-card"

    card.innerHTML = `

      <h3>${lote.nome}</h3>

      <div class="resumo-lote">

        <p><b>Total:</b> ${total}</p>

        <p><b>Alocados:</b> ${alocados}</p>

        <p><b>Não alocados:</b> ${naoAlocados}</p>

        <p><b>Expedidos:</b> ${expedidos}</p>

        <p><b>Saldo disponível:</b> ${saldoDisponivel}</p>

        <p><b>Status:</b> ${status}</p>

      </div>

      <div class="acoes">

        <button onclick="expedirLote('${lote.id}')">
          Expedir
        </button>

        <button onclick="alterarLote('${lote.id}')">
          Alterar
        </button>
        
        <button onclick="excluirLote('${lote.id}')">
           Excluir
        </button>


      </div>

    `



    if(status === "Finalizado"){
      containerExpedidos.appendChild(card)
    }
    else{
      containerAtivos.appendChild(card)
    }

  })



  renderResumoGeral()

}



// ------------------------------------------------
// RESUMO GERAL DO ARMAZÉM
// ------------------------------------------------
window.renderResumoGeral = function(){

  const totalLotes = state.lotes?.length || 0

  const totalPosicoes = state.posicoes?.length || 0

  const ocupadas = state.posicoes
    ?.filter(p => p.ocupada === true).length || 0

  const livres = totalPosicoes - ocupadas



  let totalExpedidos = 0

  if(state?.historicoExpedidos){

    totalExpedidos = state.historicoExpedidos
      .reduce((s,e)=> s + (Number(e.quantidade)||0),0)

  }



  const ocupacao = totalPosicoes
    ? ((ocupadas/totalPosicoes)*100).toFixed(1)
    : 0



  document.getElementById("resumoLotes").textContent = totalLotes

  document.getElementById("resumoAlocados").textContent = ocupadas

  document.getElementById("resumoNaoAlocados").textContent = livres

  document.getElementById("resumoExpedidos").textContent = totalExpedidos

  document.getElementById("resumoSaldo").textContent = ocupacao + "%"

}



// ------------------------------------------------
// EXPEDIR LOTE
// ------------------------------------------------
window.expedirLote = function(loteId){

  const qtd = Number(prompt("Quantidade a expedir"))

  if(!qtd || qtd <= 0) return



  if(!state.historicoExpedidos){
    state.historicoExpedidos = []
  }



  state.historicoExpedidos.push({

    id: Date.now(),

    lote_id: loteId,

    quantidade: qtd,

    data: new Date().toISOString()

  })



  renderDashboard()

}



// ------------------------------------------------
// ALTERAR QUANTIDADE DO LOTE
// ------------------------------------------------
window.alterarLote = function(loteId){

  const lote = state.lotes.find(l => String(l.id) === String(loteId))

  if(!lote) return

  const alocados = contarAlocados(lote.id)

  const novoTotal = Number(
    prompt("Nova quantidade do lote:", lote.quantidade)
  )

  if(!novoTotal) return



  // REGRA DE SEGURANÇA
  if(novoTotal < alocados){

    alert(
      `Não é possível reduzir.\n` +
      `Existem ${alocados} posições alocadas no mapa.`
    )

    return

  }



  lote.quantidade = novoTotal

  renderDashboard()

}

// ------------------------------------------------
// EXCLUIR LOTE COM VALIDAÇÃO
// ------------------------------------------------
window.excluirLote = function(loteId){

  const lote = state.lotes.find(
    l => String(l.id) === String(loteId)
  )

  if(!lote) return


  const alocados = state.posicoes.filter(p =>
    p.ocupada === true &&
    String(p.lote_id) === String(loteId)
  ).length


  if(alocados > 0){

    alert(
      "Não é possível excluir o lote.\n" +
      "Existem gaylords alocados no mapa."
    )

    return
  }


  const expedidos = state.historicoExpedidos
    ?.filter(e => String(e.lote_id) === String(loteId))
    .reduce((s,e)=> s + (Number(e.quantidade)||0),0) || 0


  if(expedidos > 0){

    alert(
      "Não é possível excluir o lote.\n" +
      "Existem gaylords expedidos."
    )

    return
  }


  if(!confirm(`Deseja excluir o lote ${lote.nome}?`)) return


  // REMOVE DO STATE
  state.lotes = state.lotes.filter(
    l => String(l.id) !== String(loteId)
  )


  // ATUALIZA TELA
  renderDashboard()

}
