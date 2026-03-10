// ===============================================
// EXPEDICAO.JS
// ===============================================

window.expedicaoContext = {
  loteId: null,
  posicoes: []
};


// =====================================================
// ABRIR MODAL DE EXPEDIÇÃO
// =====================================================
window.abrirModalExpedicao = function(loteId){

  const modal = document.getElementById("modalExpedicao");
  const lista = document.getElementById("listaExpedicao");

  if(!modal || !lista) return;

  lista.innerHTML = "";

  const posicoes = state.posicoes.filter(p =>
    p.ocupada === true &&
    idEquals(p.lote_id, loteId)
  );

  expedicaoContext.loteId = loteId;
  expedicaoContext.posicoes = posicoes;

  if(posicoes.length === 0){

    lista.innerHTML = "<p>Nenhuma gaylord alocada.</p>";
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
        onchange="atualizarContadorExpedicao()"
      >

      <span class="info-expedicao">
        <b>${pos.rz || "-"}</b>
        | Volume ${pos.volume || "-"}
      </span>
    `;

    lista.appendChild(linha);

  });

  atualizarContadorExpedicao();

  modal.classList.remove("hidden");

};


// =====================================================
// FECHAR MODAL EXPEDIÇÃO
// =====================================================
window.fecharModalExpedicao = function(){

  const modal = document.getElementById("modalExpedicao");

  if(modal){
    modal.classList.add("hidden");
  }

};


// =====================================================
// SELECIONAR TODOS
// =====================================================
window.selecionarTodosExpedicao = function(){

  const checks = document.querySelectorAll(".check-expedicao");

  checks.forEach(cb=>{
    cb.checked = true;
  });

  atualizarContadorExpedicao();

};


// =====================================================
// DESMARCAR TODOS
// =====================================================
window.desmarcarTodosExpedicao = function(){

  const checks = document.querySelectorAll(".check-expedicao");

  checks.forEach(cb=>{
    cb.checked = false;
  });

  atualizarContadorExpedicao();

};


// =====================================================
// CONTADOR DE SELECIONADOS
// =====================================================
window.atualizarContadorExpedicao = function(){

  const contador = document.getElementById("contadorExpedicao");

  if(!contador) return;

  const checks = document.querySelectorAll(".check-expedicao:checked");

  contador.innerText = checks.length;

};


// =====================================================
// CONFIRMAR EXPEDIÇÃO
// =====================================================
window.confirmarExpedicao = async function(){

  const checks = document.querySelectorAll(".check-expedicao:checked");

  if(checks.length === 0){
    alert("Selecione ao menos uma gaylord.");
    return;
  }

  const dataExpedicao = new Date().toISOString();

  try{

    // ======================================
    // POSIÇÕES SELECIONADAS
    // ======================================

    const posicoesSelecionadas = [];

    checks.forEach(check=>{

      const pos = getPosicaoById(check.value);

      if(pos){
        posicoesSelecionadas.push(pos);
      }

    });

    if(posicoesSelecionadas.length === 0){
      alert("Nenhuma posição válida selecionada.");
      return;
    }


    // ======================================
    // MONTAR HISTÓRICO
    // ======================================

    const historicoInsert = posicoesSelecionadas.map(pos=>({

      lote_id: pos.lote_id,
      posicao_id: pos.id,
      rz: pos.rz,
      volume: pos.volume,
      data_expedicao: dataExpedicao

    }));


    // ======================================
    // INSERT HISTÓRICO
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
    // LIBERAR POSIÇÕES
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
    // GARANTIR HISTÓRICO NO STATE
    // ======================================

    if(!state.historico_expedidos){
      state.historico_expedidos = [];
    }


    // ======================================
    // ATUALIZA HISTÓRICO LOCAL
    // ======================================

    historicoData.forEach(reg=>{
      state.historico_expedidos.push(reg);
    });


    // ======================================
