const fs = require('fs');
const html = fs.readFileSync('kap_debug.html', 'utf8');
const regex = /<button[^>]*>(.*?)<\/button>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log(match[1].replace(/<[^>]*>?/gm, ''));
}
