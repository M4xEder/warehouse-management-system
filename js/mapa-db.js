// =======================================
// MAPA-DB.JS — CARREGA MAPA DO SUPABASE
// =======================================

window.carregarMapaDoBanco = async function () {
  console.log('🔄 Carregando mapa do banco...');

  // 1. Buscar áreas
  const { data: areas, error: errAreas } =
    await supabase.from('areas').select('*');

  if (errAreas) {
    console.error(errAreas);
    alert('Erro ao carregar áreas');
    return;
  }

  // 2. Buscar ruas
  const { data: ruas, error: errRuas } =
    await supabase.from('ruas').select('*');

  if (errRuas) {
    console.error(errRuas);
    alert('Erro ao carregar ruas');
    return;
  }

  // 3. Buscar posições
  const { data: posicoes, error: errPos } =
    await supabase.from('posicoes').select('*');

  if (errPos) {
    console.error(errPos);
    alert('Erro ao carregar posições');
    return;
  }

  // 🧠 Converter para o formato do state
  state.areas = areas.map(area => ({
    nome: area.nome,
    ruas: ruas
      .filter(r => r.area_id === area.id)
      .map(rua => ({
        nome: rua.nome,
        posicoes: posicoes
          .filter(p => p.rua_id === rua.id)
          .sort((a, b) => a.posicao_numero - b.posicao_numero)
          .map(p => ({
            ocupada: p.ocupada,
            lote: p.lote_nome,
            rz: p.rz,
            volume: p.volume
          }))
      }))
  }));

  console.log('✅ Mapa carregado do banco');
};
