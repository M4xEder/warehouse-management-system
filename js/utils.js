// ===============================
// UTILS.JS — FUNÇÕES AUXILIARES
// ===============================

// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          total++;
        }
      });
    });
  });

  return total;
};

// -------------------------------
// TOTAL EXPEDIDO DO LOTE
// -------------------------------
window.totalExpedidoDoLote = function (nomeLote) {
  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos
    .filter(h => h.lote === nomeLote)
    .reduce((soma, h) => soma + h.detalhes.length, 0);
};
/* ===============================
   HEADER PADRÃO DO SISTEMA
=============================== 

#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f4c430;
  padding: 12px 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

#header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

/* Ações 
#header .acoes {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

#header .acoes span {
  font-size: 14px;
  color: #000;
}

/* Botões 
#header button {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  background: #16a34a;
  color: #fff;
}

#header button:hover {
  opacity: 0.9;
}

#header button.danger {
  background: #dc2626;
}

/* RESPONSIVO 
@media (max-width: 768px) {
  #header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  #header .acoes {
    width: 100%;
    justify-content: space-between;
  }
}

*/
