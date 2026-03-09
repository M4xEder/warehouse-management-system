// ==============================================
// DASHBOARD.JS — CONTROLE DE LOTES
// ==============================================



// ------------------------------------------------
// CONTAR POSIÇÕES ALOCADAS NO MAPA
// ------------------------------------------------
function contarAlocados(loteId){

  if(!state || !state.posicoes) return 0

  return state.posicoes.filter(p =>
    p.ocupada === true &&
    String(p.lote_id) === String(loteId)
  ).length

}



// ------------------------------------------------
// CONTAR EXPEDIDOS
// ------------------------------------------------
function contarExpedidos(loteId){

  if(!state || !state.historicoExpedidos) return 0

  return state.historicoExpedidos
    .filter(e => String(e.lote_id) === String(loteId))
    .length

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

  if(!state || !state.lotes) return



  state.lotes.forEach(lote=>{

    // TOTAL DO LOTE (FIXO)
    const total = Number(lote.quantidade || 0)

    const alocados = contarAlocados(lote.id)

    const expedidos = contarExpedidos(lote.id)

    const naoAlocados = Math.max(0,total - alocados)

    const saldoDisponivel = Math.max(0,total - expedidos)



    // STATUS
    let status = "Ativo"

    if(saldoDisponivel === 0){
      status = "Expedido completo"
    }
    else if(expedidos > 0){
      status = "Expedição parcial"
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



    // ------------------------------------------
    // DEFINIR EM QUAL SESSÃO ENTRA
    // ------------------------------------------

    if(status === "Expedido completo"){

      containerExpedidos.appendChild(card)

    }
    else{

      containerAtivos.appendChild(card)

      // se for parcial também aparece em expedidos
      if(status === "Expedição parcial"){

        const clone = card.cloneNode(true)
        containerExpedidos.appendChild(clone)

      }

    }

  })



  renderResumoGeral()

}



// ------------------------------------------------
// RESUMO GERAL DO ARMAZÉM
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



  const el1 = document.getElementById("resumoLotes")
  const el2 = document.getElementById("resumoAlocados")
  const el3 = document.getElementById("resumoNaoAlocados")
  const el4 = document.getElementById("resumoExpedidos")
  const el5 = document.getElementById("resumoSaldo")

  if(el1) el1.textContent = totalLotes
  if(el2) el2.textContent = ocupadas
  if(el3) el3.textContent = livres
  if(el4) el4.textContent = totalExpedidos
  if(el5) el5.textContent = ocupacao + "%"

}



// ------------------------------------------------
// EXCLUIR LOTE (SUPABASE)
// ------------------------------------------------
window.excluirLote = async function (loteId) {

  const lote = state.lotes.find(
    l => String(l.id) === String(loteId)
  );

  if (!lote) return;


  // verificar posições alocadas
  const alocados = state.posicoes.filter(p =>
    p.ocupada === true &&
    String(p.lote_id) === String(loteId)
  ).length;


  if (alocados > 0) {

    alert(
      "Não é possível excluir o lote.\n\n" +
      "Existem gaylords alocados no mapa."
    );

    return;

  }


  // verificar expedidos
  const expedidos = contarExpedidos(loteId)


  if (expedidos > 0) {

    alert(
      "Não é possível excluir o lote.\n\n" +
      "Existem gaylords expedidos."
    );

    return;

  }


  if (!confirm(`Deseja excluir o lote "${lote.nome}" ?`)) {
    return;
  }


  try {

    const { error } = await window.supabaseClient
      .from("lotes")
      .delete()
      .eq("id", loteId);

    if (error) throw error;


    state.lotes = state.lotes.filter(
      l => String(l.id) !== String(loteId)
    );


    if (typeof renderDashboard === "function") {
      renderDashboard();
    }

    if (typeof renderMapa === "function") {
      renderMapa();
    }


    alert("Lote excluído com sucesso.");

  }
  catch (err) {

    console.error(err);

    alert("Erro ao excluir lote.");

  }

    }
