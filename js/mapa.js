function criarPosicao() {
  return { ocupada: false, lote: null, rz: null, volume: null };
}
function criarRua(nome, qtd) {
  return { id: crypto.randomUUID(), nome, posicoes: Array.from({length: qtd}, criarPosicao) };
}
function criarArea(nome) {
  return { id: crypto.randomUUID(), nome, ruas: [] };
}

window.cadastrarArea = function() {
  const input = document.getElementById('areaNome');
  if(!input.value.trim()) { alert('Informe o nome da área'); return; }
  state.areas.push(criarArea(input.value.trim()));
  input.value = '';
  saveState();
  renderMapa();
};

window.adicionarRua = function(areaId) {
  const area = state.areas.find(a => a.id === areaId);
  const nome = prompt('Nome da rua'); if(!nome) return;
  const qtd = Number(prompt('Quantidade de posições')); if(!qtd || qtd<=0){alert('Quantidade inválida'); return;}
  area.ruas.push(criarRua(nome,qtd));
  saveState();
  renderMapa();
};

window.excluirArea = function(areaId){
  const area = state.areas.find(a=>a.id===areaId);
  if(area.ruas.some(r=>r.posicoes.some(p=>p.ocupada))){alert('Não é possível excluir a área com gaylords alocadas'); return;}
  if(confirm('Deseja excluir esta área?')){state.areas=state.areas.filter(a=>a.id!==areaId); saveState(); renderMapa();}
};
window.excluirRua = function(areaId,ruaId){
  const area=state.areas.find(a=>a.id===areaId);
  const rua=area.ruas.find(r=>r.id===ruaId);
  if(rua.posicoes.some(p=>p.ocupada)){alert('Não é possível excluir a rua com gaylords alocadas'); return;}
  if(confirm('Deseja excluir esta rua?')){area.ruas=area.ruas.filter(r=>r.id!==ruaId); saveState(); renderMapa();}
};

window.renderMapa = function(){
  const mapa = document.getElementById('mapa'); if(!mapa) return;
  mapa.innerHTML='';

  state.areas.forEach(area=>{
    const areaDiv=document.createElement('div'); areaDiv.className='area';
    areaDiv.innerHTML=`<div class="area-header"><strong>${area.nome}</strong><button class="danger" onclick="excluirArea('${area.id}')">Excluir Área</button></div>`;
    area.ruas.forEach(rua=>{
      const ruaDiv=document.createElement('div'); ruaDiv.className='rua';
      ruaDiv.innerHTML=`<div class="rua-header">Rua ${rua.nome}<button class="danger" onclick="excluirRua('${area.id}','${rua.id}')">Excluir Rua</button></div>`;
      const posicoesDiv=document.createElement('div'); posicoesDiv.className='posicoes';
      rua.posicoes.forEach((pos,posIndex)=>{
        const p=document.createElement('div'); p.className='posicao';
        if(pos.ocupada){p.classList.add('ocupada'); const lote=state.lotes.find(l=>l.nome===pos.lote); if(lote)p.style.background=lote.cor; p.title=`Lote: ${pos.lote}\nRZ: ${pos.rz}\nVolume: ${pos.volume||'-'}`;}
        p.onclick=()=>abrirModalEndereco(area.id,rua.id,posIndex);
        posicoesDiv.appendChild(p);
      });
      ruaDiv.appendChild(posicoesDiv); areaDiv.appendChild(ruaDiv);
    });
    const btnRua=document.createElement('button'); btnRua.textContent='Adicionar Rua'; btnRua.onclick=()=>adicionarRua(area.id);
    areaDiv.appendChild(btnRua); mapa.appendChild(areaDiv);
  });

  if(typeof renderDashboard==='function') renderDashboard();
};

// Abrir modal de endereço
function abrirModalEndereco(areaId, ruaId, posIndex){
  const modal=document.getElementById('modal'); modal.classList.remove('hidden');
  const select=document.getElementById('modalLote'); select.innerHTML='';
  state.lotes.filter(l=>l.ativo!==false).forEach(l=>{const opt=document.createElement('option'); opt.value=l.nome; opt.textContent=l.nome; select.appendChild(opt);});
  modal.dataset.area=areaId; modal.dataset.rua=ruaId; modal.dataset.pos=posIndex;
}

window.fecharModal = function(){document.getElementById('modal').classList.add('hidden');};
window.confirmarEndereco = function(){
  const modal=document.getElementById('modal');
  const areaId=modal.dataset.area; const ruaId=modal.dataset.rua; const pos=Number(modal.dataset.pos);
  const lote=document.getElementById('modalLote').value;
  const rz=document.getElementById('modalRz').value;
  const volume=document.getElementById('modalVolume').value;
  const area=state.areas.find(a=>a.id===areaId);
  const rua=area.ruas.find(r=>r.id===ruaId);
  const posObj=rua.posicoes[pos];
  posObj.ocupada=true; posObj.lote=lote; posObj.rz=rz; posObj.volume=volume;
  saveState(); renderMapa(); fecharModal();
};
window.removerGaylord=function(){
  const modal=document.getElementById('modal');
  const area=state.areas.find(a=>a.id===modal.dataset.area);
  const rua=area.ruas.find(r=>r.id===modal.dataset.rua);
  const pos=Number(modal.dataset.pos);
  const posObj=rua.posicoes[pos]; posObj.ocupada=false; posObj.lote=null; posObj.rz=null; posObj.volume=null;
  saveState(); renderMapa(); fecharModal();
};
