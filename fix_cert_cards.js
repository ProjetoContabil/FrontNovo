const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Replace the old p-8 rounded-3xl with the unified one
code = code.replace(/className="bg-white p-8 rounded-3xl border border-zinc-200\/80 shadow-\[0_4px_24px_rgba\(0,0,0,0\.015\)\] space-y-6"/g, 
'className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 space-y-6"');

// Replace the active company bar
code = code.replace(/className="bg-white p-6 rounded-3xl border border-zinc-200\/80 shadow-\[0_4px_20px_rgba\(0,0,0,0\.02\)\] flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"/g,
'className="bg-white rounded-2xl border border-zinc-200/65 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden"');

fs.writeFileSync('app/page.tsx', code);
