const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// Find all buttons
// This regex matches `<button ...>` and replaces `bg-white` with `bg-[#bfc3c9]` inside it.
// Note: handling multiline attributes in JS regex can be tricky, so let's do a custom parser or simpler regex.

let result = '';
let inButton = false;
let currentTag = '';

for (let i = 0; i < code.length; i++) {
  if (code.substr(i, 7) === '<button') {
    inButton = true;
  }
  
  if (inButton) {
    currentTag += code[i];
    if (code[i] === '>') {
      // replace bg-white in currentTag
      currentTag = currentTag.replace(/\bbg-white\b/g, 'bg-[#bfc3c9]');
      // also maybe remove hover:bg-zinc-50, hover:bg-zinc-100? Let's change them to hover:bg-[#aab0b8] for better UX, or just leave it, or remove it.
      // actually, changing to bg-[#bfc3c9] might need hover:bg-[#aab0b8] to look good, but let's just do what they asked.
      currentTag = currentTag.replace(/hover:bg-zinc-50/g, 'hover:bg-[#aab0b8]');
      currentTag = currentTag.replace(/hover:bg-zinc-100/g, 'hover:bg-[#aab0b8]');
      
      result += currentTag;
      currentTag = '';
      inButton = false;
    }
  } else {
    result += code[i];
  }
}

fs.writeFileSync('app/page.tsx', result);
console.log("White buttons replaced successfully.");
