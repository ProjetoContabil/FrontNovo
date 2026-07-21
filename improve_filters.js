const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Add states
code = code.replace(
  /const \[filterRegime, setFilterRegime\] = useState\("all"\);\s*const \[filterAcesso, setFilterAcesso\] = useState\("all"\);/,
  `const [filterRegime, setFilterRegime] = useState("all");\n  const [filterAcesso, setFilterAcesso] = useState("all");\n  const [filterStatus, setFilterStatus] = useState("all");\n  const [filterPgdas, setFilterPgdas] = useState("all");`
);

// 2. Update useEffect dependency
code = code.replace(
  /\[searchTerm, filterRegime, filterAcesso, companiesPage\]\);/,
  `[searchTerm, filterRegime, filterAcesso, filterStatus, filterPgdas, companiesPage]);`
);

// 3. Update filteredCompanies
const oldFilterBody = `    const matchesAcesso = 
      filterAcesso === "all" || 
      (filterAcesso === "Configurado" && c.statusAcesso !== "Não Configurado") ||
      (filterAcesso === "Não Configurado" && c.statusAcesso === "Não Configurado");

    return matchesSearch && matchesRegime && matchesAcesso;`;

const newFilterBody = `    const matchesAcesso = 
      filterAcesso === "all" || 
      (filterAcesso === "Configurado" && c.statusAcesso !== "Não Configurado") ||
      (filterAcesso === "Não Configurado" && c.statusAcesso === "Não Configurado");

    const matchesStatus = 
      filterStatus === "all" ||
      c.statusEmpresa === filterStatus ||
      (filterStatus === "Ativa" && !c.statusEmpresa);

    const matchesPgdas =
      filterPgdas === "all" ||
      c.statusPgdas === filterPgdas;

    return matchesSearch && matchesRegime && matchesAcesso && matchesStatus && matchesPgdas;`;

code = code.replace(oldFilterBody, newFilterBody);

// 4. Update the key for tbody to include new filters
code = code.replace(
  /key=\{\`\$\{companiesPage\}-\$\{searchTerm\}-\$\{filterRegime\}-\$\{filterAcesso\}\`\}/g,
  `key={\`\${companiesPage}-\${searchTerm}-\${filterRegime}-\${filterAcesso}-\${filterStatus}-\${filterPgdas}\`}`
);

fs.writeFileSync('app/page.tsx', code);
console.log("States and filter logic updated.");
