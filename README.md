# Data Sheet Structure (DSS) v1.0

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.19659516.svg)](https://doi.org/10.5281/zenodo.19659516)

**Status:** Proposal / Draft v1.0  
**Author:** Vincenzo Manto ([datastripes.com](https://datastripes.com))  
**License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

DSS is a text-based data exchange format designed to represent **multi-sheet, sparse spreadsheet data** in a way that is natively **human-readable** and **Git-friendly**.

---

## 1. Rationale
The tech world is stuck between two suboptimal choices for tabular data:
*   **CSV:** Simple and Git-friendly, but lacks support for multiple sheets and forces "comma-padding" for sparse data.
*   **XLSX/ODS:** Feature-rich, but binary/compressed (opaque to Git) and impossible to read without specialized software.

**DSS bridges this gap.** It treats spreadsheets as a collection of coordinate-based data blocks in a plain-text file.

## 2. Core Principles
1.  **Human First:** If you can't read it in `notepad.exe`, it's not DSS.
2.  **Git-Native:** Changes to a single cell must result in a single-line diff.
3.  **Sparse by Design:** Only populated cells occupy space. No padding required.
4.  **Parsing Simplicity:** A compliant parser must be implementable in <100 lines of code.

---

## 3. Technical Specification

### 3.1 Metadata (Frontmatter)
Every DSS file may begin with an optional YAML-compliant metadata block.
```dss
---
project: Global Economy Simulation
version: 1.0.0
encoding: UTF-8
---
```

### 3.2 Sheet Declaration
Sheets are defined using square brackets. A DSS file can contain an infinite number of sheets.
*   **Syntax:** `[Sheet Name]`
*   **Constraints:** Sheet names must be unique.

### 3.3 The Anchor System (`@` Notation)
This is the core of the protocol. Instead of a stream of values, DSS uses **Coordinate Anchors** in A1 notation.
*   **Syntax:** `@ A1`, `@ C10`, `@ AA500`
*   **Behavior:** An anchor sets the "Active Cursor". All data rows following an anchor are placed relative to that coordinate.
*   **Last-Man-Win:** If two data blocks overlap, the values defined last in the file overwrite previous ones.

---

## 4. Syntax Example

```dss
[Financials]
@ A1
"Period", "Revenue", "Margin"
"Q1", 10500.50, 0.22
"Q2", 12000.00, 0.25

@ E1
"Status", "Final"
"Audited", true

[Metadata_Private]
@ A1
"Internal_ID", 99823
```

---

## 5. Formal Grammar (EBNF)
```text
<file>        ::= [<metadata>] <sheet_list>
<metadata>    ::= "---" <newline> { <key_value> <newline> } "---" <newline>
<sheet_list>  ::= { <sheet_block> }
<sheet_block> ::= "[" <name> "]" <newline> { <anchor_block> }
<anchor_block>::= "@" <coordinate> <newline> <csv_data>
<coordinate>  ::= [A-Z]+[0-9]+
<csv_data>    ::= { <row> <newline> }
<row>         ::= <value> { "," <value> }
```

---

## 6. Comparison Matrix

| Feature | CSV | XLSX | **DSS** |
| :--- | :---: | :---: | :---: |
| **Multi-Sheet** | ❌ | ✅ | ✅ |
| **Sparse Placement** | ❌ | ✅ | ✅ |
| **Git/Diff Friendly** | ✅ | ❌ | ✅ |
| **Plain Text** | ✅ | ❌ | ✅ |
| **Internal Metadata**| ❌ | ✅ | ✅ |

---

## 7. Implementation Guide for Developers
To build a DSS-compliant parser, follow this logic:

1.  **Sheet Map:** Initialize a Map/Dictionary to hold sheets.
2.  **State Machine:**
    *   **On `[`**: Create/Switch to the named sheet.
    *   **On `@`**: Parse A1 coordinate (e.g., `B2` -> `row:1, col:1`). This is your **Base Offset**.
    *   **On Data Row**: 
        *   Split by comma (respecting quotes).
        *   For each value at index `i`, assign it to `Sheet[BaseRow + CurrentLine][BaseCol + i]`.
        *   Increment `CurrentLine` for the next row of data.
3.  **Comments:** Lines starting with `#` must be ignored.

---

## 8. MIME & Integration
*   **Extension:** `.dss`
*   **MIME Type:** `text/dss`
*   **Encoding:** Must be `UTF-8`.

---

*This standard is part of the Datastripes ecosystem. For tools, parsers, and plugins, visit [howtocsv.com](https://howtocsv.com).*
