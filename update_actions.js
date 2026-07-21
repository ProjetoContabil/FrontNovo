const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const targetStr = `                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => editCompany(company)}
                                  className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-[10px] font-extrabold shadow-2xs transition-all cursor-pointer flex items-center gap-1 select-none"
                                  title="Editar cadastro da empresa"
                                >
                                  <Pencil className="h-3 w-3 text-zinc-400" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCompanyCnpj(company.cnpj);
                                    if (company.statusAcesso !== "Não Configurado") {
                                      setMetodoAcesso(company.statusAcesso === "e-CNPJ Ativo" ? "certificado" : "procuracao");
                                    }
                                    setCurrentPage("certificados");
                                    addToast(\`Configurando acesso fiscal para \${company.razaoSocial}\`, "info");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold shadow-xs transition-all cursor-pointer"
                                >
                                  Gerenciar
                                </button>
                              </div>`;

const replacement = `                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedCompanyForDetails(company);
                                    setCurrentPage("detalhes_empresa");
                                  }}
                                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-extrabold shadow-xs transition-all cursor-pointer"
                                  title="Ver detalhes da empresa"
                                >
                                  Detalhes
                                </button>
                                <button
                                  onClick={() => editCompany(company)}
                                  className="px-2.5 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-lg text-[10px] font-extrabold shadow-2xs transition-all cursor-pointer flex items-center gap-1 select-none"
                                  title="Editar cadastro da empresa"
                                >
                                  <Pencil className="h-3 w-3 text-zinc-400" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCompanyCnpj(company.cnpj);
                                    if (company.statusAcesso !== "Não Configurado") {
                                      setMetodoAcesso(company.statusAcesso === "e-CNPJ Ativo" ? "certificado" : "procuracao");
                                    }
                                    setCurrentPage("certificados");
                                    addToast(\`Configurando acesso fiscal para \${company.razaoSocial}\`, "info");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold shadow-xs transition-all cursor-pointer"
                                >
                                  Gerenciar
                                </button>
                              </div>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacement);
    fs.writeFileSync('app/page.tsx', code);
    console.log("Successfully updated actions");
} else {
    console.log("Could not find targetStr");
}
