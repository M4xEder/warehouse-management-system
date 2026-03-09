// ==============================================
// DASHBOARD.JS — CONTROLE DE LOTES (ENTERPRISE)
// ==============================================


// ------------------------------------------------
// CONTAR POSIÇÕES ALOCADAS
// ------------------------------------------------
function contarAlocados(loteId){

  if(!state?.posicoes) return 0

  return state.posicoes.filter(p =>
    p.ocupada === true &&
    idEquals(p.lote_id, loteId)
  ).length

}



// ------------------------------------------------
// CONTAR EXPEDIDOS
// ------------------------------------------------
function contarExpedidos(loteId){

  if(!state?.historico_expedidos) return 0

  return state.historico_expedidos
    .filter(e => idEquals(e.lote_id, loteId))
    .length

}



// ------------------------------------------------
// RENDER DASHBOARD
// ------------------------------------------------
window.renderDashboard = function(){

  const containerAtivos = document.getElementById("lotesAtivos")
  const containerExpedidos = document.getElementById("lotesExpedidos")

  if(!containerAtivos || !containerExpedidos) return

  containerAtivos.innerHTML = ""
  containerExpedidos.innerHTML = ""

  if(!state?.lotes) return



  state.lotes.forEach(lote=>{

    const total = Number(lote.quantidade || 0)

    const alocados = contarAlocados(lote.id)

    const expedidos = contarExpedidos(lote.id)

    const naoAlocados = Math.max(0, total - alocados)

    const saldo = Math.max(0, total - expedidos)



    let status = "Ativo"

    if(saldo === 0){
      status = "Expedido completo"
    }
    else if(expedidos > 0){
      status = "Expedição parcial"
    }



    // =========================================
    // LOTES ATIVOS
    // =========================================
    if(status !== "Expedido completo"){

      const card = document.createElement("div")

      card.className = "lote-card"

      card.innerHTML = `

        <h3>${lote.nome}</h3>

        <div class="resumo-lote">

          <p><b>Total:</b> ${total}</p>
          <p><b>Alocados:</b> ${alocados}</p>
          <p><b>Não alocados:</b> ${naoAlocados}</p>
          <p><b>Expedidos:</b> ${expedidos}</p>
          <p><b>Saldo:</b> ${saldo}</p>
          <p><b>Status:</b> ${status}</p>

        </div>

        <div class="acoes">

          <button onclick="abrirModalExpedicao('${lote.id}')">
            Expedir
          </button>

          <button onclick="alterarQuantidadeLote('${lote.id}')">
            Alterar
          </button>

          <button onclick="excluirLote('${lote.id}')">
            Excluir
          </button>

        </div>

      `

      containerAtivos.appendChild(card)

    }



    // =========================================
    // LOTES EXPEDIDOS (LAYOUT SIMPLIFICADO)
    // =========================================
    if(expedidos > 0){

      const card = document.createElement("div")

      card.className = "lote-card-expedido"

      card.innerHTML = `

        <h3>${lote.nome}</h3>

        <p><b>Total Gaylords:</b> ${total}</p>

        <p><b>Status:</b> ${status}</p>

        <div class="acoes">

          <button onclick="verDetalhesExpedicao('${lote.id}')">
            Detalhes
          </button>

          <button onclick="excluirLote('${lote.id}')">
            Excluir
          </button>

        </div>

      `

      containerExpedidos.appendChild(card)

    }

  })



  renderResumoGeral()

}



// ------------------------------------------------
// RESUMO GERAL
// ------------------------------------------------
window.renderResumoGeral = function(){

  const totalLotes = state?.lotes?.length || 0

  const totalPosicoes = state?.posicoes?.length || 0

  const ocupadas = state?.posicoes
    ?.filter(p => p.ocupada === true).length || 0

  const livres = totalPosicoes - ocupadas

  const expedidos = state?.historico_expedidos?.length || 0

  const ocupacao = totalPosicoes
    ? ((ocupadas / totalPosicoes) * 100).toFixed(1)
    : 0



  document.getElementById("resumoLotes").textContent = totalLotes
  document.getElementById("resumoAlocados").textContent = ocupadas
  document.getElementById("resumoNaoAlocados").textContent = livres
  document.getElementById("resumoExpedidos").textContent = expedidos
  document.getElementById("resumoSaldo").textContent = ocupacao + "%"

}
