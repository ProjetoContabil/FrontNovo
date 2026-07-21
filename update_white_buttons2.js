const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// Match <button ...> taking multiple lines into account
// Use [\s\S]*? to match the attributes inside the button tag
const regex = /<button([^>]*)>/g;
code = code.replace(regex, (match, p1) => {
  // If the button has bg-white, replace it with bg-[#bfc3c9]
  if (p1.includes('bg-white')) {
    let replaced = p1.replace(/\bbg-white\b/g, 'bg-[#bfc3c9]');
    replaced = replaced.replace(/\bhover:bg-zinc-50\b/g, 'hover:bg-[#aab0b8]');
    replaced = replaced.replace(/\bhover:bg-zinc-100\b/g, 'hover:bg-[#aab0b8]');
    return '<button' + replaced + '>';
  }
  return match;
});

fs.writeFileSync('app/page.tsx', code);
console.log("Replaced white buttons robustly.");
