const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

const regex = /className="([^"]*bg-white[^"]*)"/g;
let match;
const replacements = [];

while ((match = regex.exec(code)) !== null) {
  // Check the preceding text to see if it's inside a button tag.
  // We look backwards from match.index. If we see '<button' before we see '>', or if we are just reasonably sure it's a button.
  let isButton = false;
  for (let i = match.index; i >= 0; i--) {
    if (code.substr(i, 7) === '<button') {
      isButton = true;
      break;
    }
    if (code.substr(i, 2) === '/>' || (code[i] === '>' && code[i-1] !== '=')) {
      // found another tag's end, so it's not a button
      break;
    }
  }

  if (isButton) {
    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      oldStr: match[0],
      newStr: match[0].replace('bg-white', 'bg-[#bfc3c9]')
                             .replace('hover:bg-zinc-50', 'hover:bg-[#aab0b8]')
                             .replace('hover:bg-zinc-100', 'hover:bg-[#aab0b8]')
    });
  }
}

// apply replacements from end to start
for (let i = replacements.length - 1; i >= 0; i--) {
  let rep = replacements[i];
  code = code.substring(0, rep.start) + rep.newStr + code.substring(rep.end);
}

fs.writeFileSync('app/page.tsx', code);
console.log(`Replaced ${replacements.length} buttons.`);
