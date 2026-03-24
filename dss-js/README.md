# sdk-dss

A pure JavaScript library for parsing, serializing, and converting DSS (Data Sheet Standard) files. No dependencies. Supports:

- Parse/serialize DSS files
- Convert CSV <-> DSS
- Convert minimal XLSX/XLS/XLSM <-> DSS (XML only, no ZIP)

DSS is a simple, human-readable text format for representing spreadsheet data, designed for easy parsing and generation in code. It supports multiple sheets, sparse data, and metadata.

The full DSS specification can be found in the [README.md](https://github.com/Datastripes/DataSheetStandard/) file at the root of this repository.

The library is downloadable from [npmjs](https://www.npmjs.com/package/sdk-dss/).

## Install

```
# Local usage (no publish required)
npm install sdk-dss
```

## Usage

```js
const { parseDSS, serializeDSS, csvToDSS, dssToCSV, xlsxToDSS, dssToXLSX } = require('sdk-dss');

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
