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

  const posicoes = (state.posicoes || []).filter(p =>
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
        <b>${pos.rz}</b> | Volume ${pos.volume}
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
  if(modal) modal.classList.add("hidden");

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

      const pos = (state.posicoes || []).find(
        p => String(p.id) === String(posId)
      );

      if(!pos) continue;

      // registrar histórico
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

      // liberar posição
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

      // atualizar state
      pos.ocupada = false;
      pos.lote_id = null;
      pos.volume = null;
      pos.rz = null;

    }


    // --------------------------------
    // VERIFICAR STATUS DO LOTE
    // --------------------------------

    const lote = (state.lotes || []).find(
      l => String(l.id) === String(expedicaoContext.loteId)
    );

    if(lote){

      const { data:expedidas } = await supabaseClient
        .from("historico_expedidos")
        .select("id")
        .eq("lote_id", lote.id);

      const totalExpedidas = expedidas ? expedidas.length : 0;

      if(totalExpedidas >= lote.quantidade){

        await supabaseClient
          .from("lotes")
          .update({ status: "expedido_completo" })
          .eq("id", lote.id);

        lote.status = "expedido_completo";

      }
      else if(totalExpedidas > 0){

        await supabaseClient
          .from("lotes")
          .update({ status: "expedido_parcial" })
          .eq("id", lote.id);

        lote.status = "expedido_parcial";

      }

    }

    if(typeof renderMapa === "function") renderMapa();
    if(typeof renderDashboard === "function") renderDashboard();

    fecharModalExpedicao();

  }
  catch(err){

    console.error(err);
    alert("Erro ao registrar expedição.");

  }

};
