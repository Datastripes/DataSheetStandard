# Specification: Data Sheet Standard (DSS) v1.0

**Status:** Proposal / Draft v1.0  
**Author:** Vincenzo Manto @ datastripes.com / ilovecsv.com / ihatecsv.com  
**Extension:** `.DSS`  
**MIME Type:** `text/DSS`  
**Encoding:** `UTF-8`

---

## 1. Abstract
The Data Sheet Standard (DSS) is a text-based, human-readable data format designed to represent multi-sheet spreadsheet data. Unlike CSV, it supports multiple tabs and sparse data placement via an anchor-based system. Unlike XLSX, it is non-binary, non-XML, and fully compatible with version control systems (Git-friendly).

## 2. Design Principles
1. **Human Readable:** A user should be able to understand the data by opening the file in a simple text editor.
2. **Sparse Data Support:** Only populated cells are stored. No "padding" with empty commas is required to reach a specific coordinate.
3. **Multi-Sheet:** A single file can contain multiple named sheets.
4. **Git-Friendly:** Changes to a single cell result in a predictable, single-line diff.
5. **Simplicity:** Parsers should be implementable in under 100 lines of code.

---

## 3. File Structure
A DSS file consists of three optional/mandatory layers:
1. **Global Metadata** (Optional)
2. **Sheet Declarations** (Mandatory for multi-sheet)
3. **Data Anchors** (Mandatory)

### 3.1 Header (Global Metadata)
The file begins with an optional metadata block encapsulated by triple dashes `---`.
```DSS
---
format: DSS 1.0
created_by: Datastripes
date: 2023-10-27
---
```

### 3.2 Sheet Declaration
Sheets are defined by a name enclosed in square brackets.
*   **Syntax:** `[Sheet Name]`
*   **Rules:** Sheet names must be unique within the file. Characters `[` and `]` are reserved.

### 3.3 Data Anchors (The Coordinate System)
Anchors define where a block of data starts on the 2D grid using standard A1 notation.
*   **Syntax:** `@ Coordinate` (e.g., `@ A1`, `@ M20`)
*   **Behavior:** All subsequent lines of data are relative to this anchor until a new anchor or sheet is declared.

---

## 4. Data Syntax
Inside an anchored block, data follows a strict CSV-inspired structure (RFC 4180 compliant).

### 4.1 Delimiters
*   The default delimiter is the **comma** `,`.
*   Rows are separated by standard line breaks (`LF` or `CRLF`).

### 4.2 Data Types
DSS is "type-aware" through notation:
*   **String:** Wrapped in double quotes (e.g., `"Sales Report"`). Mandatory if the string contains commas or line breaks.
*   **Numeric:** Unquoted digits (e.g., `123`, `45.67`).
*   **Boolean:** `true` or `false` (case-insensitive).
*   **Null/Empty:** Represented by an empty value between commas or a explicit `null`.
*   **Formula:** (Optional) Prefixed with `=`, stored as a string (e.g., `"=SUM(B2:B10)"`).

---

## 5. Formal Grammar (EBNF-like)
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

## 6. Implementation Example
Below is an example of a `.DSS` file representing a complex, sparse spreadsheet.

```DSS
---
project: Financial Forecast
version: 2.1
---

[Quarterly Report]
@ A1
"Department", "Budget", "Actual"
"Marketing", 50000, 48500
"R&D", 120000, 131000

@ G1
"Status: Over Budget"
"Risk Level: Low"

@ A10
"Notes:"
"The R&D department exceeded budget due to hardware acquisition."

[Settings]
@ B2
"Tax Rate", 0.22
"Currency", "EUR"
```

---

## 7. Parsing Logic (Reference for Developers)
To parse a DSS file:
1.  **Initialize** a dictionary of sheets.
2.  **Iterate** through lines:
    *   If line starts with `[`, create a new sheet object/key.
    *   If line starts with `@`, parse the A1 coordinate into row/column indices (e.g., `B2` -> `row 1, col 1`). This is the **Active Cursor**.
    *   If line contains data, split by comma (respecting quotes). Map each value to `Active Cursor + current_offset`. Increment `Active Cursor` row for the next line.
3.  **Ignore** lines starting with `#` (comments).

---

## 8. Why DSS vs Others

| Feature | CSV | XLSX (XML) | **DSS** |
| :--- | :--- | :--- | :--- |
| **Multi-Sheet** | No | Yes | **Yes** |
| **Sparse Data** | No (requires `,` padding) | Yes | **Yes** |
| **Git-Friendly** | Yes | No (Binary/Compressed) | **Yes** |
| **Human Readable** | Yes | No | **Yes** |
| **Parsing Overhead** | Extremely Low | High | **Low** |

---

## 9. Future Extensions
*   **Cell Styling:** Optional CSS-like block for formatting (e.g., `$ A1:B10 { font-weight: bold; }`).
*   **Encryption:** Support for encrypted data blocks within specific sheets.

---

**Standardization Note:**  
This format is released under the **CC0 1.0 Universal (Public Domain Dedication)**. It is free for use, modification, and distribution in any software, specifically intended for the `Datastripes` ecosystem and the `ilovecsv.com` toolkit.