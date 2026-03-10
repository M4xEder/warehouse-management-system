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
    // LIBERAR POSIÇÕES NO STATE
    // ======================================

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



// =====================================================
// VER DETALHES DA EXPEDIÇÃO (TABELA)
// =====================================================
window.verDetalhesExpedicao = function(loteId){

  if(!state || !state.historico_expedidos){
    alert("Histórico não carregado.");
    return;
  }

  const registros = state.historico_expedidos.filter(r =>
    idEquals(r.lote_id, loteId)
  );

  if(registros.length === 0){
    alert("Nenhuma expedição encontrada.");
    return;
  }

  const modal = document.getElementById("modalDetalhesExpedicao");
  const lista = document.getElementById("listaDetalhesExpedicao");

  if(!modal || !lista){
    alert("Modal não encontrado.");
    return;
  }

  lista.innerHTML = "";

  const tabela = document.createElement("table");

  tabela.className = "tabela-expedicao";

  tabela.innerHTML = `
    <thead>
      <tr>
        <th>RZ</th>
        <th>Volume</th>
        <th>Data</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabela.querySelector("tbody");

  registros.forEach(reg=>{

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${reg.rz || "-"}</td>
      <td>${reg.volume || "-"}</td>
      <td>${new Date(reg.data_expedicao).toLocaleString()}</td>
    `;

    tbody.appendChild(tr);

  });

  lista.appendChild(tabela);

  modal.classList.remove("hidden");

};



// =====================================================
// FECHAR DETALHES
// =====================================================
window.fecharDetalhesExpedicao = function(){

  const modal = document.getElementById("modalDetalhesExpedicao");

  if(modal){
    modal.classList.add("hidden");
  }

};
