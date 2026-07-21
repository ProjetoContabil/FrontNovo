const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
const startIdx = code.indexOf('{/* 1. Header Navigation */}');
const endIdx = code.indexOf('{currentPage === "cadastro_empresa" && (');
if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `{/* Header Navigation - Integra Contador */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
              <div>
                <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-display">Integra Contador: PGDAS-D</h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Integração Direta Serpro API</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setCurrentPage("dashboard"); }}
                  className="px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-[10px] font-extrabold transition-all shadow-xs select-none"
                >
                  Voltar ao Dashboard
                </button>
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
              {/* Painel Esquerdo: Parâmetros */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="h-4 w-4 text-emerald-600" /> Parâmetros da Requisição
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">CNPJ da Empresa</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs mt-1 bg-zinc-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" 
                        value={pgdasEmpresaCnpj}
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Competência (MM/AAAA)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs mt-1 bg-zinc-50 focus:bg-white transition-colors outline-none focus:border-emerald-500" 
                        value={pgdasCompetencia}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
                    <button 
                      onClick={() => addToast("Consultando PGDAS-D na API Serpro...", "info")}
                      className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Search className="h-3.5 w-3.5" /> Consultar Declaração
                    </button>
                    <button 
                      onClick={() => addToast("Transmitindo PGDAS-D via API Serpro...", "success")}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <Send className="h-3.5 w-3.5" /> Transmitir Declaração
                    </button>
                  </div>
                </div>
              </div>

              {/* Painel Direito: Resultados e Downloads */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm min-h-[300px]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-3 mb-4">
                    <Globe className="h-4 w-4 text-emerald-600" /> Resposta da API Serpro
                  </h3>
                  
                  <div className="bg-zinc-900 rounded-xl p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                    <p className="text-zinc-500 mb-2">// Última consulta realizada com sucesso</p>
                    <pre>
{JSON.stringify({
  "status": "SUCESSO",
  "mensagem": "Declaração PGDAS-D recuperada com sucesso.",
  "dados": {
    "cnpj": pgdasEmpresaCnpj,
    "competencia": pgdasCompetencia,
    "receitaBruta": 178800.00,
    "valorDevido": pgdasPreviewInterna?.dasCalculado || 15400.00,
    "numeroRecibo": "NAO_TRANSMITIDO"
  }
}, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button 
                      onClick={() => addToast("Gerando DAS via API Serpro...", "info")}
                      className="px-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <FileText className="h-6 w-6 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase">Gerar Guia DAS</span>
                    </button>
                    <button 
                      onClick={() => addToast("Gerando Recibo via API Serpro...", "info")}
                      className="px-4 py-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-700 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase">Obter Recibo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        `;
    
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('app/page.tsx', code);
    console.log("Successfully replaced PGDAS section");
} else {
    console.log("Could not find boundaries");
}
