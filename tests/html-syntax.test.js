const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*)<\/script>/);

if (!match) {
  console.error('index.html script not found');
  process.exit(1);
}

try {
  new vm.Script(match[1]);
  console.log('index.html script syntax: ok');
} catch (error) {
  console.error(error);
  process.exit(1);
}
