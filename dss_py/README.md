# dss-py

A pure Python library for parsing, serializing, and converting DSS (Data Sheet Standard) files. No dependencies. Supports:

- Parse/serialize DSS files
- Convert CSV <-> DSS
- Convert minimal XLSX/XLS/XLSM <-> DSS (XML only, no ZIP)

## Usage

```python
from dss import parse_dss, serialize_dss, csv_to_dss, dss_to_csv, xlsx_to_dss, dss_to_xlsx

dss = parse_dss(dss_string)
dss_string = serialize_dss(dss)
dss_from_csv = csv_to_dss(csv_string)
csv = dss_to_csv(dss_from_csv)
dss_from_xlsx = xlsx_to_dss(xlsx_xml_string)
xlsx_xml = dss_to_xlsx(dss_from_xlsx)
```

## License

CC0 1.0 Universal (Public Domain Dedication)
