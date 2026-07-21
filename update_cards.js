const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const startStr = '            {/* Metrics cards (aligned with the design in second image) */}';
const endStr = '                  </div>\n                );\n              })}\n            </div>';

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { 
                  title: "Empresas Ativas", 
                  value: companies.filter(c => c.statusEmpresa === "Ativa" || !c.statusEmpresa).length.toString(), 
                  subtitle: "Em operação regular",
                  trend: "up",
                  trendText: "+2 novas no mês",
                  trendColor: "text-emerald-700 bg-emerald-100/50",
                  icon: Building, 
                  color: "text-emerald-600 bg-emerald-50 border-emerald-100/50",
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setCurrentPage("empresas");
                  }
                },
                { 
                  title: "Empresas Suspensas", 
                  value: companies.filter(c => c.statusEmpresa === "Suspensa").length.toString(), 
                  subtitle: "Aguardando regularização",
                  trend: "neutral",
                  trendText: "0 alterações",
                  trendColor: "text-amber-700 bg-amber-100/50",
                  icon: AlertCircle, 
                  color: "text-amber-600 bg-amber-50 border-amber-100/50", 
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setCurrentPage("empresas");
                  }
                },
                { 
                  title: "Empresas Inativas", 
                  value: companies.filter(c => c.statusEmpresa === "Inativa").length.toString(), 
                  subtitle: "Paralisadas temporariamente",
                  trend: "down",
                  trendText: "-1 neste mês",
                  trendColor: "text-zinc-700 bg-zinc-200/50",
                  icon: Lock, 
                  color: "text-zinc-600 bg-zinc-100 border-zinc-200/50", 
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setCurrentPage("empresas");
                  }
                },
                { 
                  title: "Empresas Excluídas", 
                  value: companies.filter(c => c.statusEmpresa === "Excluída").length.toString(), 
                  subtitle: "Registros arquivados",
                  trend: "neutral",
                  trendText: "Nenhuma recente",
                  trendColor: "text-rose-700 bg-rose-100/50",
                  icon: Trash2, 
                  color: "text-rose-600 bg-rose-50 border-rose-100/50", 
                  action: () => {
                    setFilterRegime("all");
                    setFilterAcesso("all");
                    setCurrentPage("empresas");
                  }
                }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={i} 
                    onClick={stat.action}
                    className="bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.title}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-black text-zinc-900 font-display tracking-tighter">{stat.value}</p>
                        </div>
                      </div>
                      <div className={\`p-3 rounded-2xl border shrink-0 transition-all duration-300 group-hover:scale-110 \${stat.color}\`}>
                        <Icon className="h-5.5 w-5.5" strokeWidth={2} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100/80">
                      <div className="flex items-center gap-2">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${stat.trendColor}\`}>
                          {stat.trendText}
                        </span>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                          {stat.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Arrow Icon top-right */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-zinc-400 translate-y-1 group-hover:translate-y-0 translate-x--1 group-hover:translate-x-0">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>`;

    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('app/page.tsx', code);
    console.log("Successfully updated dashboard cards");
} else {
    console.log("Could not find boundaries");
}
