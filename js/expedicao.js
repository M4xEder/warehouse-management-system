// ===============================================
// EXPEDICAO.JS — ULTRA OTIMIZADO (BATCH MODE)
// ===============================================

window.expedicaoContext = {
  loteId:null,
  posicoes:[]
};



// ------------------------------------------------
// ABRIR MODAL
// ------------------------------------------------
window.abrirModalExpedicao = function(loteId){

  const modal = document.getElementById("modalExpedicao");
  const lista = document.getElementById("listaExpedicao");

  if(!modal || !lista) return;

  lista.innerHTML = "";

  const posicoes = state.posicoes.filter(p =>
    p.ocupada === true &&
    idEquals(p.lote_id,loteId)
  );

  expedicaoContext.loteId = loteId;
  expedicaoContext.posicoes = posicoes;

  if(posicoes.length === 0){

    lista.innerHTML = "<p>Nenhuma gaylord alocada</p>";
    modal.classList.remove("hidden");
    return;

  }

  posicoes.forEach(pos=>{

    const linha = document.createElement("label");

    linha.className = "linha-expedicao";

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
    `;

    lista.appendChild(linha);

  });

  modal.classList.remove("hidden");

};



// ------------------------------------------------
// FECHAR MODAL
// ------------------------------------------------
window.fecharModalExpedicao = function(){

  const modal = document.getElementById("modalExpedicao");

  if(modal){
    modal.classList.add("hidden");
  }

};



// ------------------------------------------------
// CONFIRMAR EXPEDIÇÃO (BATCH MODE)
// ------------------------------------------------
window.confirmarExpedicao = async function(){

  const checks = document.querySelectorAll(".check-expedicao:checked");

  if(checks.length === 0){
    alert("Selecione ao menos uma gaylord.");
    return;
  }

  const dataExpedicao = new Date().toISOString();

  try{

    // ======================================
    // BUSCAR POSIÇÕES SELECIONADAS
    // ======================================

    const posicoesSelecionadas = [];

    checks.forEach(check=>{

      const pos = getPosicaoById(check.value);

      if(pos){
        posicoesSelecionadas.push(pos);
      }

    });


    // ======================================
    // MONTAR INSERT EM LOTE
    // ======================================

    const historicoInsert = posicoesSelecionadas.map(pos=>({

      lote_id:pos.lote_id,
      posicao_id:pos.id,
      area:pos.area,
      rua:pos.rua,
      posicao:pos.posicao,
      rz:pos.rz,
      volume:pos.volume,
      data_expedicao:dataExpedicao

    }));


    // ======================================
    // INSERT EM LOTE
    // ======================================

    const { data:historicoData, error:histErr } =
      await supabaseClient
        .from("historico_expedidos")
        .insert(historicoInsert)
        .select();

    if(histErr) throw histErr;


    // ======================================
    // IDS DAS POSIÇÕES
    // ======================================

    const posIds = posicoesSelecionadas.map(p=>p.id);


    // ======================================
    // UPDATE EM LOTE
    // ======================================

    const { error:updateErr } =
      await supabaseClient
        .from("posicoes")
        .update({
          ocupada:false,
          lote_id:null,
          rz:null,
          volume:null
        })
        .in("id",posIds);

    if(updateErr) throw updateErr;


    // ======================================
    // ATUALIZA STATE LOCAL
    // ======================================

    if(!state.historico_expedidos){
      state.historico_expedidos = [];
    }

    historicoData.forEach(reg=>{
      state.historico_expedidos.push(normalizeId(reg));
    });


    posIds.forEach(id=>{

      const index = state.posicoes.findIndex(p =>
        idEquals(p.id,id)
      );

      if(index !== -1){

        state.posicoes[index].ocupada = false;
        state.posicoes[index].lote_id = null;
        state.posicoes[index].rz = null;
        state.posicoes[index].volume = null;

      }

    });


    // ======================================
    // RENDER IMEDIATO
    // ======================================

    fecharModalExpedicao();

    if(typeof renderMapa === "function"){
      renderMapa();
    }

    if(typeof renderDashboard === "function"){
      renderDashboard();
    }

  }
  catch(err){

    console.error(err);
    alert("Erro ao registrar expedição.");

  }

};
