const fs = require('fs');
const code = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /<button[\s\S]*?>/g;
let match;
while ((match = regex.exec(code)) !== null) {
  if (match[0].includes('bg-white')) {
    console.log(match[0].replace(/\s+/g, ' '));
  }
}
