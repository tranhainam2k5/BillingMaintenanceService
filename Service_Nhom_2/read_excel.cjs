const xlsx = require('xlsx');
const workbook = xlsx.readFile('Nhom_5.xlsx');
const sheet_name_list = workbook.SheetNames;
sheet_name_list.forEach(sheetName => {
    console.log('--- Sheet:', sheetName, '---');
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, {header: 1});
    data.forEach(row => console.log(row.join(' | ')));
});
