const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// The action code blocks are like:
// action: () => {
//   setFilterRegime("all");
//   setFilterAcesso("all");
//   setCurrentPage("empresas");
// }

// But they correspond to different status. Let's just do a regex replace.
// They are inside the dashboard cards array.

// "Empresas Ativas"
code = code.replace(
  /action:\s*\(\)\s*=>\s*\{\s*setFilterRegime\("all"\);\s*setFilterAcesso\("all"\);\s*setCurrentPage\("empresas"\);\s*\}/,
  `action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Ativa");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }`
);

// "Empresas Suspensas"
code = code.replace(
  /action:\s*\(\)\s*=>\s*\{\s*setFilterRegime\("all"\);\s*setFilterAcesso\("all"\);\s*setCurrentPage\("empresas"\);\s*\}/,
  `action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Suspensa");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }`
);

// "Empresas Inativas"
code = code.replace(
  /action:\s*\(\)\s*=>\s*\{\s*setFilterRegime\("all"\);\s*setFilterAcesso\("all"\);\s*setCurrentPage\("empresas"\);\s*\}/,
  `action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Inativa");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }`
);

// "Empresas Excluídas"
code = code.replace(
  /action:\s*\(\)\s*=>\s*\{\s*setFilterRegime\("all"\);\s*setFilterAcesso\("all"\);\s*setCurrentPage\("empresas"\);\s*\}/,
  `action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setFilterStatus("Excluída");
                    setFilterPgdas("all");
                    setCurrentPage("empresas");
                  }`
);

// And we have one on the navbar? No, the other places are probably default ones.
// When clicking "nav-empresas" from sidebar, we should probably reset them all? Or leave them as is. Leaving as is makes sense.
// But we should also add the UI for filterStatus and filterPgdas.

// Find the UI block
const oldUI = `<div className="flex w-full sm:w-auto gap-3">
                  <div className="relative min-w-[180px]">
                    <select
                      value={filterRegime}
                      onChange={(e) => { setFilterRegime(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[13px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Todos os Regimes</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative min-w-[180px]">
                    <select
                      value={filterAcesso}
                      onChange={(e) => { setFilterAcesso(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[13px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Todas as Apurações</option>
                      <option value="Configurado">Configurado</option>
                      <option value="Não Configurado">Não Configurado</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>`;

const newUI = `<div className="flex w-full sm:w-auto gap-3 flex-wrap lg:flex-nowrap">
                  <div className="relative flex-1 min-w-[160px]">
                    <select
                      value={filterRegime}
                      onChange={(e) => { setFilterRegime(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[13px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Regime: Todos</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[160px]">
                    <select
                      value={filterAcesso}
                      onChange={(e) => { setFilterAcesso(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[13px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Conexão: Todas</option>
                      <option value="Configurado">Configurado</option>
                      <option value="Não Configurado">Não Configurado</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[160px]">
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[13px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Status: Todos</option>
                      <option value="Ativa">Ativa</option>
                      <option value="Suspensa">Suspensa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Excluída">Excluída</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[160px]">
                    <select
                      value={filterPgdas}
                      onChange={(e) => { setFilterPgdas(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[13px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">PGDAS: Todos</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Processando">Processando</option>
                      <option value="Sem Movimento">Sem Movimento</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>`;

// Wait, the regex replacement for oldUI might fail because of exact whitespace.
// Let's use a split approach or simple indexOf.
const idxStart = code.indexOf('<div className="flex w-full sm:w-auto gap-3">');
if (idxStart !== -1) {
  const idxEnd = code.indexOf('</div>\n              </div>\n              <div className="overflow-x-auto">', idxStart);
  if (idxEnd !== -1) {
    code = code.substring(0, idxStart) + newUI + code.substring(idxEnd);
    console.log("UI replaced!");
  } else {
    console.log("UI end not found");
  }
} else {
  console.log("UI start not found");
}

fs.writeFileSync('app/page.tsx', code);
