// ===============================
// RUAS.JS — SUPABASE (ENDEREÇAMENTO PROFISSIONAL)
// ===============================

// ===============================
// CARREGAR RUAS DO BANCO
// ===============================
window.carregarRuasDoBanco = async function () {

try {

const { data, error } = await window.supabaseClient  
  .from('ruas')  
  .select('*')  
  .order('created_at', { ascending: true });  

if (error) throw error;  

state.ruas = data || [];

} catch (err) {

console.error('Erro ao buscar ruas:', err);  
state.ruas = [];

}

};

// ===============================
// CRIAR RUA + POSIÇÕES AUTOMÁTICAS
// ===============================
window.criarRua = async function (areaId) {

const nome = prompt('Nome da rua');
if (!nome) return;

const quantidade = Number(
prompt('Quantas posições essa rua terá?')
);

if (!quantidade || quantidade <= 0) {
alert('Quantidade inválida.');
return;
}

try {

// ===============================  
// 1️⃣ CRIAR RUA  
// ===============================  
const { data: novaRua, error: erroRua } =  
  await window.supabaseClient  
    .from('ruas')  
    .insert([{  
      nome: nome,  
      area_id: areaId,  
      quantidade_posicoes: quantidade  
    }])  
    .select()  
    .single();  

if (erroRua) throw erroRua;  


// ===============================  
// 2️⃣ CRIAR POSIÇÕES AUTOMÁTICAS  
// ===============================  
const posicoes = [];  

for (let i = 1; i <= quantidade; i++) {  

  posicoes.push({  
    rua_id: novaRua.id,  
    numero: i,  
    ocupada: false  
  });  

}  

const { error: erroPosicoes } =  
  await window.supabaseClient  
    .from('posicoes')  
    .insert(posicoes);  

if (erroPosicoes) throw erroPosicoes;  


// ===============================  
// 3️⃣ ATUALIZAR SISTEMA  
// ===============================  
alert('Rua criada com sucesso!');  

await carregarSistema();

} catch (err) {

console.error('Erro ao criar rua:', err);  
alert('Erro ao criar rua.');

}

};

// ===============================
// EXCLUIR RUA
// ===============================
window.excluirRua = async function (ruaId) {

if (!confirm('Excluir rua? Isso removerá todas as posições dela.')) return;

try {

const { error } =  
  await window.supabaseClient  
    .from('ruas')  
    .delete()  
    .eq('id', ruaId);  

if (error) throw error;  

await carregarSistema();

} catch (err) {

console.error('Erro ao excluir rua:', err);  
alert('Erro ao excluir rua.');

}

};

// ===============================
// BUSCAR RUAS DE UMA ÁREA
// ===============================
window.getRuasDaArea = function (areaId) {

if (!state.ruas) return [];

return state.ruas.filter(
rua => rua.area_id === areaId
);

};
