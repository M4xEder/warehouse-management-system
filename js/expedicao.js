// ===============================================
// EXPEDICAO.JS — CONTROLE DE EXPEDIÇÃO
// ===============================================

window.expedicaoContext = {
  loteId:null,
  posicoes:[]
};



// ------------------------------------------------
// ABRIR MODAL
// ------------------------------------------------
window.abrirModalExpedicao = function(loteId){

  const modal = document.getElementById("modalExpedicao")
  const lista = document.getElementById("listaExpedicao")

  if(!modal || !lista) return

  lista.innerHTML = ""

  const posicoes = state.posicoes.filter(p =>
    p.ocupada === true &&
    idEquals(p.lote_id, loteId)
  )

  expedicaoContext.loteId = loteId
  expedicaoContext.posicoes = posicoes



  if(posicoes.length === 0){

    lista.innerHTML = "<p>Nenhuma gaylord alocada</p>"
    modal.classList.remove("hidden")
    return

  }



  posicoes.forEach(pos=>{

    const linha = document.createElement("label")

    linha.className = "linha-expedicao"

    linha.innerHTML = `

      <input
        type="checkbox"
        class="check-expedicao"
        value="${pos.id}"
        checked
      >

      <span style="margin-left:8px">

        <b>${pos.rz || "-"}</b>
        | Volume ${pos.volume || "-"}

      </span>

    `

    lista.appendChild(linha)

  })



  modal.classList.remove("hidden")

}



// ------------------------------------------------
// FECHAR MODAL
// ------------------------------------------------
window.fecharModalExpedicao = function(){

  const modal = document.getElementById("modalExpedicao")

  if(modal){
    modal.classList.add("hidden")
  }

}



// ------------------------------------------------
// CONFIRMAR EXPEDIÇÃO
// ------------------------------------------------
window.confirmarExpedicao = async function(){

  const checks = document.querySelectorAll(".check-expedicao:checked")

  if(checks.length === 0){

    alert("Selecione ao menos uma gaylord.")
    return

  }

  const dataExpedicao = new Date().toISOString()



  try{

    for(const check of checks){

      const posId = check.value

      const pos = getPosicaoById(posId)

      if(!pos) continue



      // REGISTRA HISTÓRICO
      const { error } = await supabaseClient
        .from("historico_expedidos")
        .insert({
          lote_id:pos.lote_id,
          posicao_id:pos.id,
          area:pos.area,
          rua:pos.rua,
          posicao:pos.posicao,
          rz:pos.rz,
          volume:pos.volume,
          data_expedicao:dataExpedicao
        })

      if(error) throw error



      // LIBERA POSIÇÃO
      const { error:errPos } = await supabaseClient
        .from("posicoes")
        .update({
          ocupada:false,
          lote_id:null,
          rz:null,
          volume:null
        })
        .eq("id",pos.id)

      if(errPos) throw errPos

    }



    fecharModalExpedicao()



  }catch(err){

    console.error(err)
    alert("Erro ao registrar expedição.")

  }

}
