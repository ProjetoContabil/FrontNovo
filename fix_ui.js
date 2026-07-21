const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /<div className="flex w-full sm:w-auto gap-3">[\s\S]*?<div className="overflow-x-auto">/;
const newUI = `<div className="flex w-full md:w-auto gap-3 flex-wrap lg:flex-nowrap">
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterRegime}
                      onChange={(e) => { setFilterRegime(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Regime: Todos</option>
                      <option value="Simples Nacional">Simples Nacional</option>
                      <option value="Lucro Presumido">Lucro Presumido</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterAcesso}
                      onChange={(e) => { setFilterAcesso(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Conexão: Todas</option>
                      <option value="Configurado">Configurado</option>
                      <option value="Não Configurado">Não Configurado</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">Status: Todos</option>
                      <option value="Ativa">Ativa</option>
                      <option value="Suspensa">Suspensa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Excluída">Excluída</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={filterPgdas}
                      onChange={(e) => { setFilterPgdas(e.target.value); setCompaniesPage(1); }}
                      className="w-full appearance-none px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 text-[12px] font-bold rounded-full outline-none cursor-pointer transition-all text-zinc-700 h-11 pr-10"
                    >
                      <option value="all">PGDAS: Todos</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Processando">Processando</option>
                      <option value="Sem Movimento">Sem Movimento</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">`;

if (regex.test(code)) {
  code = code.replace(regex, newUI);
  console.log("Replaced!");
} else {
  console.log("Not replaced");
}

fs.writeFileSync('app/page.tsx', code);
