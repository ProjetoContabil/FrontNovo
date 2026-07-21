const fs = require('fs');
const code = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /className="[^"]*bg-white[^"]*"/g;
let match;
while ((match = regex.exec(code)) !== null) {
  const context = code.substring(match.index - 50, match.index + match[0].length + 50);
  if (context.includes('<button') || context.includes('button')) {
    console.log(match[0]);
  }
}
