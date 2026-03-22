from typing import Dict, List, Optional, Any
import re

# DSS object types
dss_metadata = Dict[str, str]
dss_anchor = Dict[str, Any]  # {"coord": str, "data": List[List[str]]}
dss_sheet = Dict[str, List[dss_anchor]]  # {"anchors": [anchor, ...]}
dss_file = Dict[str, Any]  # {"metadata": ..., "sheets": ...}

def parse_dss(dss_text: str) -> dss_file:
    lines = dss_text.splitlines()
    i = 0
    metadata = None
    sheets = {}
    current_sheet = None
    current_anch = None
    current_data = []
    active_coord = None
    # Parse metadata
    if i < len(lines) and lines[i].strip() == '---':
        i += 1
        metadata = {}
        while i < len(lines) and lines[i].strip() != '---':
            line = lines[i].strip()
            if line and ':' in line:
                idx = line.index(':')
                metadata[line[:idx].strip()] = line[idx+1:].strip()
            i += 1
        i += 1  # skip closing ---
    # Parse sheets and anchors
    while i < len(lines):
        line = lines[i].strip()
        if not line or line.startswith('#'):
            i += 1
            continue
        if line.startswith('[') and line.endswith(']'):
            current_sheet = line[1:-1].strip()
            sheets[current_sheet] = {"anchors": []}
            current_anch = None
            i += 1
            continue
        if line.startswith('@'):
            if current_anch and current_sheet:
                sheets[current_sheet]["anchors"].append({"coord": active_coord, "data": current_data})
            active_coord = line[1:].strip()
            current_data = []
            current_anch = True
            i += 1
            continue
        # Data row (CSV, RFC4180, minimal)
        if current_anch and current_sheet:
            row = []
            s = line
            in_quotes = False
            val = ''
            j = 0
            while j < len(s):
                c = s[j]
                if c == '"':
                    if in_quotes and j+1 < len(s) and s[j+1] == '"':
                        val += '"'
                        j += 1
                    else:
                        in_quotes = not in_quotes
                elif c == ',' and not in_quotes:
                    row.append(val)
                    val = ''
                else:
                    val += c
                j += 1
            row.append(val)
            row = [v.strip() for v in row]
            current_data.append(row)
        i += 1
    # Push last anchor
    if current_anch and current_sheet:
        sheets[current_sheet]["anchors"].append({"coord": active_coord, "data": current_data})
    return {"metadata": metadata, "sheets": sheets}

def serialize_dss(dss_obj: dss_file) -> str:
    out = ''
    if dss_obj.get("metadata"):
        out += '---\n'
        for k, v in dss_obj["metadata"].items():
            out += f'{k}: {v}\n'
        out += '---\n'
    first_sheet = True
    for sheet, sheet_obj in dss_obj["sheets"].items():
        if not first_sheet:
            out += '\n'
        first_sheet = False
        out += f'[{sheet}]\n'
        for anchor in sheet_obj["anchors"]:
            out += f'@ {anchor["coord"]}\n'
            data = anchor["data"]
            for r, row in enumerate(data):
                row_str = []
                for cell in row:
                    if cell is None:
                        row_str.append('')
                        continue
                    v = str(cell)
                    # Quote if not a number, boolean, or null
                    if re.match(r'^\s*-?\d+(\.\d+)?\s*$', v) or re.match(r'^\s*(true|false|null)\s*$', v, re.I):
                        row_str.append(v)
                    else:
                        v = '"' + v.replace('"', '""') + '"'
                        row_str.append(v)
                out += ','.join(row_str)
                if r < len(data) - 1:
                    out += '\n'
            out += '\n'
    if out.endswith('\n'):
        out = out[:-1]
    return out + '\n'

def csv_to_dss(csv_text: str, sheet_name: str = 'Sheet1') -> dss_file:
    lines = [l for l in csv_text.splitlines() if l.strip()]
    data = []
    for line in lines:
        row = []
        s = line
        in_quotes = False
        val = ''
        j = 0
        while j < len(s):
            c = s[j]
            if c == '"':
                if in_quotes and j+1 < len(s) and s[j+1] == '"':
                    val += '"'
                    j += 1
                else:
                    in_quotes = not in_quotes
            elif c == ',' and not in_quotes:
                row.append(val)
                val = ''
            else:
                val += c
            j += 1
        row.append(val)
        row = [v.strip() for v in row]
        data.append(row)
    return {"sheets": {sheet_name: {"anchors": [{"coord": "A1", "data": data}]}}}

def dss_to_csv(dss_obj: dss_file) -> str:
    sheet_name = next(iter(dss_obj["sheets"]))
    sheet = dss_obj["sheets"][sheet_name]
    if not sheet["anchors"]:
        return ''
    data = sheet["anchors"][0]["data"]
    out = []
    for row in data:
        row_str = []
        for cell in row:
            if cell is None:
                row_str.append('')
                continue
            v = str(cell)
            # Quote if contains comma, quote, or newline
            if re.search(r'[",\n]', v):
                v = '"' + v.replace('"', '""') + '"'
            row_str.append(v)
        out.append(','.join(row_str))
    return '\n'.join(out)

def xlsx_to_dss(xlsx_data: str) -> dss_file:
    # Only supports XML string (not zipped XLSX)
    row_re = re.compile(r'<row[^>]*>([\s\S]*?)</row>')
    cell_re = re.compile(r'<c[^>]*>([\s\S]*?)</c>')
    v_re = re.compile(r'<v>([\s\S]*?)</v>')
    data = []
    for row_match in row_re.finditer(xlsx_data):
        row_xml = row_match.group(1)
        row = []
        for cell_match in cell_re.finditer(row_xml):
            v_match = v_re.search(cell_match.group(1))
            row.append(v_match.group(1) if v_match else '')
        data.append(row)
    return {"sheets": {"Sheet1": {"anchors": [{"coord": "A1", "data": data}]}}}

def dss_to_xlsx(dss_obj: dss_file) -> str:
    sheet_name = next(iter(dss_obj["sheets"]))
    sheet = dss_obj["sheets"][sheet_name]
    if not sheet["anchors"]:
        return ''
    data = sheet["anchors"][0]["data"]
    xml = '<worksheet><sheetData>'
    for row in data:
        xml += '<row>'
        for cell in row:
            xml += f'<c><v>{"" if cell is None else str(cell)}</v></c>'
        xml += '</row>'
    xml += '</sheetData></worksheet>'
    return xml
