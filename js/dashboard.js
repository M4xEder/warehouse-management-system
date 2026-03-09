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

    const naoAlocados = Math.max(0,total - alocados)

    const saldoDisponivel = Math.max(0,total - expedidos)



    // -----------------------------------------
    // DEFINIR STATUS
    // -----------------------------------------
    let status = "Ativo"

    if(saldoDisponivel === 0){
      status = "Expedido completo"
    }
    else if(expedidos > 0){
      status = "Expedição parcial"
    }



    // =========================================
    // CARD DE LOTES ATIVOS
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

          <p><b>Saldo disponível:</b> ${saldoDisponivel}</p>

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
    // CARD DE LOTES EXPEDIDOS (ESTRUTURA NOVA)
    // =========================================
    if(status === "Expedição parcial" || status === "Expedido completo"){

      const cardExp = document.createElement("div")

      cardExp.className = "lote-card-expedido"

      cardExp.innerHTML = `

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

      containerExpedidos.appendChild(cardExp)

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



  const totalExpedidos = state?.historicoExpedidos
    ? state.historicoExpedidos.length
    : 0



  const ocupacao = totalPosicoes
    ? ((ocupadas/totalPosicoes)*100).toFixed(1)
    : 0



  document.getElementById("resumoLotes").textContent = totalLotes
  document.getElementById("resumoAlocados").textContent = ocupadas
  document.getElementById("resumoNaoAlocados").textContent = livres
  document.getElementById("resumoExpedidos").textContent = totalExpedidos
  document.getElementById("resumoSaldo").textContent = ocupacao + "%"

}
