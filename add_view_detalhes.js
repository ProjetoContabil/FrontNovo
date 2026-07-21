const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const targetStr = `        {/* ====================================================================
            VIEW: EMPRESAS (LISTA DE CLIENTES)
            ==================================================================== */}`;

const newView = `        {/* ====================================================================
            VIEW: DETALHES EMPRESA
            ==================================================================== */}
        {currentPage === "detalhes_empresa" && selectedCompanyForDetails && (
          <motion.div
            key="detalhes_empresa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-20 relative"
          >
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 tracking-wider uppercase mb-1">
                  <button onClick={() => setCurrentPage("empresas")} className="hover:text-emerald-600 transition-colors cursor-pointer">Empresas</button>
                  <ChevronRight className="h-3 w-3 text-zinc-300" />
                  <span className="text-zinc-600">Detalhes do Cliente</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight font-display">
                  {selectedCompanyForDetails.razaoSocial}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold \${
                    selectedCompanyForDetails.statusEmpresa === "Ativa" || !selectedCompanyForDetails.statusEmpresa
                      ? "bg-emerald-50 text-emerald-600"
                      : selectedCompanyForDetails.statusEmpresa === "Suspensa"
                      ? "bg-amber-50 text-amber-600"
                      : selectedCompanyForDetails.statusEmpresa === "Inativa"
                      ? "bg-zinc-100 text-zinc-600"
                      : "bg-rose-50 text-rose-600"
                  }\`}>
                    <span className={\`w-1.5 h-1.5 rounded-full \${
                      selectedCompanyForDetails.statusEmpresa === "Ativa" || !selectedCompanyForDetails.statusEmpresa
                        ? "bg-emerald-500"
                        : selectedCompanyForDetails.statusEmpresa === "Suspensa"
                        ? "bg-amber-500"
                        : selectedCompanyForDetails.statusEmpresa === "Inativa"
                        ? "bg-zinc-400"
                        : "bg-rose-500"
                    }\`}></span>
                    {selectedCompanyForDetails.statusEmpresa || "Ativa"}
                  </span>
                  <div className="w-[1px] h-3 bg-zinc-300" />
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">CNPJ: <span className="text-zinc-800">{selectedCompanyForDetails.cnpj}</span></p>
                  <div className="w-[1px] h-3 bg-zinc-300" />
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Regime: <span className="text-zinc-800">{selectedCompanyForDetails.regimeTributario}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => {
                    editCompany(selectedCompanyForDetails);
                  }}
                  className="flex-1 md:flex-none px-3.5 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg text-[10px] font-extrabold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider h-8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar Cadastro
                </button>
                <div className="hidden md:block pl-1">
                  {renderUserDropdown()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Esquerda: Informações Principais */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                    <Building className="h-4 w-4 text-emerald-600" /> Dados Cadastrais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nome Fantasia</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.nomeFantasia}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Localidade</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.municipio} - {selectedCompanyForDetails.uf}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Anexo da Empresa</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.tratamentoTributarioGlobal || "AUTOMATICO SISTEMA"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Última Apuração</p>
                      <p className="text-sm font-bold text-zinc-800 mt-1">{selectedCompanyForDetails.periodoApuracao}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                    <Layers className="h-4 w-4 text-emerald-600" /> Obrigações e Apurações Recentes
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { comp: "06/2026", status: "Entregue", data: "15/07/2026", imposto: "R$ 4.250,00" },
                      { comp: "05/2026", status: "Entregue", data: "14/06/2026", imposto: "R$ 3.890,50" },
                      { comp: "04/2026", status: "Entregue", data: "12/05/2026", imposto: "R$ 4.100,20" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <FileCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-900">Competência {item.comp}</p>
                            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Entregue em {item.data}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-zinc-900">{item.imposto}</p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Simples Nacional (DAS)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direita: Status e Ações */}
              <div className="space-y-6">
                <div className="bg-zinc-900 p-6 rounded-3xl shadow-sm text-white">
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Conexão e Certificado
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Status da Conexão</p>
                        <div className="flex items-center gap-2">
                          <span className={\`h-2 w-2 rounded-full animate-pulse \${selectedCompanyForDetails.statusAcesso === "Não Configurado" ? "bg-amber-500" : "bg-emerald-500"}\`} />
                          <p className="text-sm font-bold text-white">{selectedCompanyForDetails.statusAcesso}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedCompanyCnpj(selectedCompanyForDetails.cnpj);
                        if (selectedCompanyForDetails.statusAcesso !== "Não Configurado") {
                          setMetodoAcesso(selectedCompanyForDetails.statusAcesso === "e-CNPJ Ativo" ? "certificado" : "procuracao");
                        }
                        setCurrentPage("certificados");
                      }}
                      className="w-full py-2.5 bg-white text-zinc-900 hover:bg-zinc-100 font-black text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LockKeyhole className="h-3.5 w-3.5" /> 
                      {selectedCompanyForDetails.statusAcesso === "Não Configurado" ? "Configurar Acesso" : "Gerenciar Acesso"}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                  <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Layers className="h-4 w-4 text-emerald-600" /> Ações Rápidas
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setPgdasEmpresaName(selectedCompanyForDetails.razaoSocial);
                        setPgdasEmpresaCnpj(selectedCompanyForDetails.cnpj);
                        setCurrentPage("pgdas");
                      }}
                      className="p-3 bg-zinc-50 hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-emerald-700 transition-all cursor-pointer group"
                    >
                      <div className="p-2 bg-white rounded-lg group-hover:bg-emerald-100 transition-colors shadow-xs">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-center leading-tight">Apurar<br/>PGDAS</span>
                    </button>
                    <button 
                      className="p-3 bg-zinc-50 hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-200 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-600 hover:text-emerald-700 transition-all cursor-pointer group"
                    >
                      <div className="p-2 bg-white rounded-lg group-hover:bg-emerald-100 transition-colors shadow-xs">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-center leading-tight">Emitir<br/>DAS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ====================================================================
            VIEW: EMPRESAS (LISTA DE CLIENTES)
            ==================================================================== */}`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newView);
    fs.writeFileSync('app/page.tsx', code);
    console.log("Successfully added company details view");
} else {
    console.log("Could not find targetStr");
}
