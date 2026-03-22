# dss-js

A pure JavaScript library for parsing, serializing, and converting DSS (Data Sheet Standard) files. No dependencies. Supports:

- Parse/serialize DSS files
- Convert CSV <-> DSS
- Convert minimal XLSX/XLS/XLSM <-> DSS (XML only, no ZIP)

## Install

```
# Local usage (no publish required)
npm install ./dss-js
```

## Usage

```js
const { parseDSS, serializeDSS, csvToDSS, dssToCSV, xlsxToDSS, dssToXLSX } = require('dss-js');

const dss = parseDSS(dssString);
const dssString = serializeDSS(dss);
const dssFromCsv = csvToDSS(csvString);
const csv = dssToCSV(dssFromCsv);
const dssFromXlsx = xlsxToDSS(xlsxXmlString);
const xlsxXml = dssToXLSX(dssFromXlsx);
```

## Test

```
npm test
```

## License

CC0 1.0 Universal (Public Domain Dedication)
