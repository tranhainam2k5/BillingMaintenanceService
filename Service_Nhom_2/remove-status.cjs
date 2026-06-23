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

  // Remove import
  const importRegex = /import StatusChip from '@\/shared\/components\/StatusChip\.vue'[\r\n]*/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, '');
    changed = true;
  }

  // Remove StatusChip component usage
  const chipRegex1 = /<StatusChip\s+:status="[^"]+"\s*\/>/g;
  if (chipRegex1.test(content)) {
    content = content.replace(chipRegex1, '');
    changed = true;
  }

  // Remove <template #item.status="{ item }"><StatusChip :status="item.status" /></template>
  const templateRegex = /<template #item\.status="\{\s*item\s*\}">\s*<\/template>[\r\n]*/g;
  if (templateRegex.test(content)) {
    content = content.replace(templateRegex, '');
    changed = true;
  }
  const templateRegex2 = /<template #item\.status="\{\s*item\s*\}"><StatusChip :status="item\.status" \/><\/template>[\r\n]*/g;
  if (templateRegex2.test(content)) {
    content = content.replace(templateRegex2, '');
    changed = true;
  }

  // Remove table row for status like <tr><td class="text-grey">Trạng thái</td><td><StatusChip :status="contract.status" /></td></tr>
  const trRegex = /<tr><td class="text-grey">Trạng thái<\/td><td><\/td><\/tr>[\r\n]*/g;
  if (trRegex.test(content)) {
    content = content.replace(trRegex, '');
    changed = true;
  }
  
  // Remove <div>Trạng thái</div>
  const divRegex = /<div class="text-caption text-grey">Trạng thái<\/div>/g;
  if (divRegex.test(content)) {
    content = content.replace(divRegex, '');
    changed = true;
  }

  // Remove { title: 'Trạng thái', key: 'status', width: 130 },
  const headerRegex = /\{\s*title:\s*'Trạng thái',\s*key:\s*'status'.*?\},?/g;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
