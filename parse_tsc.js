const fs = require('fs');
const log = fs.readFileSync('tsc_output.txt', 'utf8');
const lines = log.split('\n');
const errors = [];
let currentFile = '';

lines.forEach(line => {
    // Match file path in error message (e.g. src/app/page.tsx(10,5): error TS...)
    // Windows paths might be different
    if (line.includes('error TS')) {
        errors.push(line.trim());
    }
});

console.log(`Total Errors: ${errors.length}`);
errors.slice(0, 20).forEach(e => console.log(e));
