// Debug: print the actual and expected DSS strings for roundtrip
const { parseDSS, serializeDSS } = require('../src/index');
const dssSample = `---\nproject: Test\n---\n[Sheet1]\n@ A1\n"A","B"\n1,2\n`;
const dssObj = parseDSS(dssSample);
const dssStr = serializeDSS(dssObj);
console.log('EXPECTED:');
console.log(JSON.stringify(dssSample));
console.log('ACTUAL:');
console.log(JSON.stringify(dssStr));
console.log('DSS parse/serialize roundtrip:', dssStr === dssSample ? 'PASS' : 'FAIL');
