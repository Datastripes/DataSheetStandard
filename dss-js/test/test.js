const fs = require('fs');
const path = require('path');
const {
  parseDSS,
  serializeDSS,
  csvToDSS,
  dssToCSV,
  xlsxToDSS,
  dssToXLSX
} = require('../src/index');

function assertEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error('Assertion failed: ' + msg + '\n' + JSON.stringify(a) + '\n!=\n' + JSON.stringify(b));
  }
}

// Test DSS parse/serialize roundtrip
const dssSample = `---\nproject: Test\n---\n[Sheet1]\n@ A1\n"A","B"\n1,2\n`;
const dssObj = parseDSS(dssSample);
const dssStr = serializeDSS(dssObj);
console.log('DSS parse/serialize roundtrip:', dssStr === dssSample ? 'PASS' : 'FAIL');

// Test CSV <-> DSS
const csv = 'A,B\n1,2';
const dssFromCsv = csvToDSS(csv, 'Sheet1');
const csvFromDss = dssToCSV(dssFromCsv);
console.log('CSV <-> DSS:', csvFromDss.trim() === csv.trim() ? 'PASS' : 'FAIL');

// Test minimal XLSX <-> DSS (not zipped, just XML string)
const fakeXlsx = '<worksheet><sheetData><row><c><v>A</v></c><c><v>B</v></c></row><row><c><v>1</v></c><c><v>2</v></c></row></sheetData></worksheet>';
const dssFromXlsx = xlsxToDSS(fakeXlsx);
const xlsxFromDss = dssToXLSX(dssFromXlsx);
console.log('XLSX <-> DSS (minimal XML):', xlsxFromDss.includes('<worksheet>') ? 'PASS' : 'FAIL');

console.log('All tests completed.');
