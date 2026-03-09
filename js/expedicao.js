// ===============================================
// EXPEDICAO.JS
// CONTROLE DE EXPEDIÇÃO DE GAYLORDS
// ===============================================

window.expedicaoContext = {
  loteId: null,
  posicoes: []
};


// ------------------------------------------------
// ABRIR MODAL DE EXPEDIÇÃO
// ------------------------------------------------
window.abrirModalExpedicao = function(loteId){

  const modal = document.getElementById("modalExpedicao");
  const lista = document.getElementById("listaExpedicao");

  if(!modal || !lista) return;

  expedicaoContext.loteId = loteId;

  lista.innerHTML = "";

  // pegar posições ocupadas do lote
  const posicoes = state.posicoes.filter(p =>
    p.ocupada === true &&
    String(p.lote_id) === String(loteId)
  );

  expedicaoContext.posicoes = posicoes;


  if(posicoes.length === 0){

    lista.innerHTML = "<p>Nenhuma gaylord alocada neste lote.</p>";
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

        <b>${pos.rz}</b>
        | Volume ${pos.volume}

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
// SELECIONAR TODOS
// ------------------------------------------------
window.selecionarTodosGaylords = function(){

  document
    .querySelectorAll(".check-expedicao")
    .forEach(c => c.checked = true);

};



// ------------------------------------------------
// DESMARCAR TODOS
// ------------------------------------------------
window.desmarcarTodosGaylords = function(){

  document
    .querySelectorAll(".check-expedicao")
    .forEach(c => c.checked = false);

};



// ------------------------------------------------
// CONFIRMAR EXPEDIÇÃO
// ------------------------------------------------
window.confirmarExpedicao = async function(){

  const checks = document.querySelectorAll(".check-expedicao:checked");

  if(checks.length === 0){

    alert("Selecione ao menos uma gaylord.");
    return;

  }


  const dataExpedicao = new Date().toISOString();


  try{

    for(const check of checks){

      const posId = check.value;

      const pos = state.posicoes.find(
        p => String(p.id) === String(posId)
      );

      if(!pos) continue;



      // ---------------------------------
      // REGISTRAR HISTÓRICO DE EXPEDIÇÃO
      // ---------------------------------
      const { error:errExp } = await supabaseClient
        .from("historico_expedidos")
        .insert({
          lote: pos.lote,
          area: pos.area,
          rua: pos.rua,
          posicao: pos.posicao,
          lote_id: pos.lote_id,
          posicao_id: pos.id,
          data_expedicao: dataExpedicao
        });

      if(errExp) throw errExp;



      // ---------------------------------
      // LIBERAR POSIÇÃO NO MAPA
      // ---------------------------------
      const { error:errPos } = await supabaseClient
        .from("posicoes")
        .update({
          ocupada:false,
          lote_id:null,
          volume:null,
          rz:null
        })
        .eq("id",pos.id);

      if(errPos) throw errPos;



      // atualizar state local
      pos.ocupada = false;
      pos.lote_id = null;
      pos.volume = null;
      pos.rz = null;

    }



    // --------------------------------
    // ATUALIZAR MAPA E DASHBOARD
    // --------------------------------
    if(typeof renderMapa === "function") renderMapa();

    if(typeof renderDashboard === "function") renderDashboard();



    fecharModalExpedicao();

  }
  catch(err){

    console.error(err);
    alert("Erro ao registrar expedição.");

  }

};
