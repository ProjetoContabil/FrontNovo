const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');
let inButton = false;
let currentTag = '';
for (let i = 0; i < code.length; i++) {
  if (code.substr(i, 2) === '<a' || code.substr(i, 5) === '<Link') {
    inButton = true;
  }
  if (inButton) {
    currentTag += code[i];
    if (code[i] === '>') {
      if (currentTag.includes('bg-white')) {
        console.log("Missed link button:", currentTag.substring(0, 150));
      }
      currentTag = '';
      inButton = false;
    }
  }
}
