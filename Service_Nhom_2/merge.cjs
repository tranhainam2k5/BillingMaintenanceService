const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'database');
const file1 = path.join(dir, 'DATABASE_API_DOCUMENT.md');
const file2 = path.join(dir, 'README_ROOM_BUILDING_API.md');
const outputFile = path.join(dir, 'COMBINED_API_DOCUMENT.md');

const content1 = fs.readFileSync(file1, 'utf8');
const content2 = fs.readFileSync(file2, 'utf8');

const combined = content1 + '\n\n' + content2;

fs.writeFileSync(outputFile, combined, 'utf8');
console.log('Successfully merged into COMBINED_API_DOCUMENT.md');
