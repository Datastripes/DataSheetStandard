// DSS Parser and Serializer (no dependencies)
// Supports: parseDSS, serializeDSS, csvToDSS, dssToCSV, xlsxToDSS, dssToXLSX (minimal pure JS)

/**
 * Parse a DSS file string into a JS object structure.
 * @param {string} dssText
 * @returns {object} { metadata, sheets: { [name]: { anchors: [{ coord, data }] } } }
 */
function parseDSS(dssText) {
  const lines = dssText.split(/\r?\n/);
  let i = 0;
  let metadata = undefined;
  const sheets = [];
  let currentSheet = null;
  let currentSheetObj = null;
  let currentAnch = null;
  let currentData = [];
  let activeCoord = null;
  // Parse metadata
  if (lines[i] && lines[i].trim() === '---') {
    i++;
    metadata = {};
    while (i < lines.length && lines[i].trim() !== '---') {
      const line = lines[i].trim();
      if (line && line.includes(':')) {
        const idx = line.indexOf(':');
        metadata[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
      i++;
    }
    i++; // skip closing ---
  }
  // Parse sheets and anchors
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) { i++; continue; }
    if (line.startsWith('[') && line.endsWith(']')) {
      // Push previous sheet if exists
      if (currentSheetObj) {
        // Push last anchor if present
        if (currentAnch && currentSheetObj) {
          currentSheetObj.anchors.push({ coord: activeCoord, data: currentData });
        }
        // Distribuisci i dati delle anchors nelle celle corrette
        currentSheetObj.data = buildSheetData(currentSheetObj.anchors);
        sheets.push(currentSheetObj);
      }
      currentSheet = line.slice(1, -1).trim();
      currentSheetObj = { name: currentSheet, data: [], anchors: [] };
      currentAnch = null;
      activeCoord = null;
      currentData = [];
      i++;
      continue;
    }
    if (line.startsWith('@')) {
      if (currentAnch && currentSheetObj) {
        currentSheetObj.anchors.push({ coord: activeCoord, data: currentData });
      }
      activeCoord = line.slice(1).trim();
      currentData = [];
      currentAnch = true;
      i++;
      continue;
    }
    // Data row (CSV, RFC4180, minimal)
    if (currentAnch && currentSheetObj) {
      // Simple CSV split, handle quoted strings
      const row = [];
      let s = line, inQuotes = false, val = '', j = 0;
      while (j < s.length) {
        const c = s[j];
        if (c === '"') {
          if (inQuotes && s[j+1] === '"') { val += '"'; j++; }
          else inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
          row.push(val);
          val = '';
        } else {
          val += c;
        }
        j++;
      }
      row.push(val);
      currentData.push(row.map(v => v.trim()));
    }
    i++;
  }
  // Push last anchor and sheet
  if (currentSheetObj) {
    if (currentAnch) {
      currentSheetObj.anchors.push({ coord: activeCoord, data: currentData });
    }
    // Distribuisci i dati delle anchors nelle celle corrette
    currentSheetObj.data = buildSheetData(currentSheetObj.anchors);
    sheets.push(currentSheetObj);
  }
  return { metadata, sheets };

  // Funzione di supporto: distribuisce i dati delle anchors nelle celle corrette
  function buildSheetData(anchors) {
    // Trova la dimensione massima necessaria
    let maxRow = 0, maxCol = 0;
    const placements = [];
    for (const anchor of anchors) {
      const { row: startRow, col: startCol } = parseCoord(anchor.coord);
      for (let r = 0; r < anchor.data.length; r++) {
        for (let c = 0; c < (anchor.data[r] ? anchor.data[r].length : 0); c++) {
          const absRow = startRow + r;
          const absCol = startCol + c;
          if (absRow > maxRow) maxRow = absRow;
          if (absCol > maxCol) maxCol = absCol;
          placements.push({ row: absRow, col: absCol, value: anchor.data[r][c] });
        }
      }
    }
    // Crea matrice vuota
    const data = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(""));
    // Popola le celle
    for (const p of placements) {
      data[p.row][p.col] = p.value;
    }
    return data;
  }

  // Funzione di supporto: converte "A1" in {row, col}
  function parseCoord(coord) {
    // Esempio: "B2" => {row:1, col:1}
    const match = /^([A-Z]+)(\d+)$/.exec(coord);
    if (!match) return { row: 0, col: 0 };
    const colStr = match[1];
    const row = parseInt(match[2], 10) - 1;
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col *= 26;
      col += colStr.charCodeAt(i) - 65 + 1;
    }
    return { row, col: col - 1 };
  }
}

/**
 * Serialize a JS DSS object to DSS file string.
 * @param {object} dssObj
 * @returns {string}
 */
function serializeDSS(dssObj) {
  let out = '';
  if (dssObj.metadata) {
    out += '---\n';
    for (const k in dssObj.metadata) {
      out += k + ': ' + dssObj.metadata[k] + '\n';
    }
    out += '---\n';
  }
  let firstSheet = true;
  for (const sheet in dssObj.sheets) {
    if (!firstSheet) out += '\n';
    firstSheet = false;
    out += `[${sheet}]\n`;
    for (const anchor of dssObj.sheets[sheet].anchors) {
      out += `@ ${anchor.coord}\n`;
      for (let r = 0; r < anchor.data.length; r++) {
        const row = anchor.data[r];
        out += row.map(cell => {
          if (cell == null) return '';
          let v = String(cell);
          // Quote if not a number or boolean or empty
          if (/^\s*-?\d+(\.\d+)?\s*$/.test(v) || /^\s*(true|false|null)\s*$/i.test(v)) {
            return v;
          }
          v = '"' + v.replace(/"/g, '""') + '"';
          return v;
        }).join(',');
        if (r < anchor.data.length - 1) out += '\n';
      }
      // Only add newline after anchor if not last anchor in last sheet
      out += '\n';
    }
  }
  // Remove trailing newline if present, then add one (to match test sample)
  if (out.endsWith('\n')) out = out.slice(0, -1);
  return out + '\n';
}

/**
 * Convert CSV string to DSS object (single sheet, anchor A1).
 * @param {string} csvText
 * @param {string} [sheetName]
 * @returns {object}
 */
function csvToDSS(csvText, sheetName = 'Sheet1') {
  // Parse CSV (minimal, RFC4180, no dependencies)
  const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
  const data = [];
  for (const line of lines) {
    const row = [];
    let s = line, inQuotes = false, val = '', j = 0;
    while (j < s.length) {
      const c = s[j];
      if (c === '"') {
        if (inQuotes && s[j+1] === '"') { val += '"'; j++; }
        else inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        row.push(val);
        val = '';
      } else {
        val += c;
      }
      j++;
    }
    row.push(val);
    data.push(row.map(v => v.trim()));
  }
  return {
    sheets: {
      [sheetName]: {
        anchors: [{ coord: 'A1', data }]
      }
    }
  };
}

/**
 * Convert DSS object to CSV string (first sheet, first anchor only).
 * @param {object} dssObj
 * @returns {string}
 */
function dssToCSV(dssObj) {
  // Only first sheet, first anchor
  const sheetName = Object.keys(dssObj.sheets)[0];
  const sheet = dssObj.sheets[sheetName];
  if (!sheet || !sheet.anchors.length) return '';
  const data = sheet.anchors[0].data;
  return data.map(row => row.map(cell => {
    if (cell == null) return '';
    const needsQuote = /[",\n]/.test(cell);
    let v = String(cell);
    if (needsQuote) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }).join(',')).join('\n');
}

/**
 * Minimal XLSX/XLS/XLSM to DSS (only supports uncompressed XML, no dependencies).
 * @param {string|ArrayBuffer} xlsxData
 * @returns {object}
 */
function xlsxToDSS(xlsxData) {
  // Only supports XML string (not zipped XLSX)
  const xml = typeof xlsxData === 'string' ? xlsxData : new TextDecoder().decode(xlsxData);
  // Find <row>...</row> blocks
  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
  const cellRe = /<c[^>]*>([\s\S]*?)<\/c>/g;
  const vRe = /<v>([\s\S]*?)<\/v>/;
  const data = [];
  let rowMatch;
  while ((rowMatch = rowRe.exec(xml))) {
    const rowXml = rowMatch[1];
    const row = [];
    let cellMatch;
    while ((cellMatch = cellRe.exec(rowXml))) {
      const vMatch = vRe.exec(cellMatch[1]);
      row.push(vMatch ? vMatch[1] : '');
    }
    data.push(row);
  }
  return {
    sheets: {
      Sheet1: {
        anchors: [{ coord: 'A1', data }]
      }
    }
  };
}

/**
 * Minimal DSS to XLSX (returns XML string, not zipped, for demo/testing).
 * @param {object} dssObj
 * @returns {string}
 */
function dssToXLSX(dssObj) {
  // Only first sheet, first anchor
  const sheetName = Object.keys(dssObj.sheets)[0];
  const sheet = dssObj.sheets[sheetName];
  if (!sheet || !sheet.anchors.length) return '';
  const data = sheet.anchors[0].data;
  let xml = '<worksheet><sheetData>';
  for (const row of data) {
    xml += '<row>';
    for (const cell of row) {
      xml += '<c><v>' + (cell == null ? '' : String(cell)) + '</v></c>';
    }
    xml += '</row>';
  }
  xml += '</sheetData></worksheet>';
  return xml;
}

module.exports = {
  parseDSS,
  serializeDSS,
  csvToDSS,
  dssToCSV,
  xlsxToDSS,
  dssToXLSX
};
