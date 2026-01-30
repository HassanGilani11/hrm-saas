const fs = require('fs');
try {
    const content = fs.readFileSync('lint-results.json', 'utf8');
    const results = JSON.parse(content);
    const filesWithErrors = results.filter(r => r.errorCount > 0);
    let output = `Files with errors: ${filesWithErrors.length}\n\n`;
    filesWithErrors.forEach(f => {
        output += `File: ${f.filePath}\n`;
        f.messages.filter(m => m.severity === 2).forEach(m => {
            output += `  Line ${m.line}: ${m.message} (${m.ruleId})\n`;
        });
        output += '\n';
    });
    fs.writeFileSync('lint_summary.txt', output);
} catch (e) {
    fs.writeFileSync('lint_summary.txt', e.toString());
}
