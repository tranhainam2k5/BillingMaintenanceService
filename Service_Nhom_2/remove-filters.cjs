const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.vue')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Remove <v-col><v-select v-model="statusFilter" ... /></v-col>
  const filterRegex = /<v-col[^>]*>\s*<v-select[^>]*v-model="statusFilter"[^>]*\/>\s*<\/v-col>[\r\n]*/g;
  if (filterRegex.test(content)) {
    content = content.replace(filterRegex, '');
    changed = true;
  }
  
  // Remove import of status constants
  const constants = [
    'BUILDING_STATUS_OPTIONS',
    'ROOM_STATUS_OPTIONS',
    'STUDENT_STATUS_OPTIONS',
    'CONTRACT_STATUS_OPTIONS',
    'APPLICATION_STATUS_OPTIONS',
    'INVOICE_STATUS_OPTIONS',
    'EQUIPMENT_STATUS_OPTIONS',
    'MAINTENANCE_STATUS_OPTIONS'
  ];
  
  constants.forEach(c => {
    // Remove individual constant from import statement
    const cRegex = new RegExp(`,\\s*${c}|${c}\\s*,\\s*|\\s*${c}\\s*`, 'g');
    if (content.includes(c)) {
      // Find import statement block containing the constant
      const importLineRegex = new RegExp(`import\\s+\\{[^\\}]*${c}[^\\}]*\\}\\s+from\\s+'@/shared/utils/constants'`);
      if (importLineRegex.test(content)) {
        let match = content.match(importLineRegex)[0];
        let newMatch = match.replace(cRegex, '');
        // clean up empty imports
        if (newMatch.includes('import { }') || newMatch.includes('import {}')) {
          newMatch = '';
        } else {
            // fix comma issues
            newMatch = newMatch.replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}');
        }
        content = content.replace(match, newMatch);
        changed = true;
      }
    }
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
