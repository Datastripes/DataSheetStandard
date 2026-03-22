from dss import parse_dss, serialize_dss, csv_to_dss, dss_to_csv, xlsx_to_dss, dss_to_xlsx

def test_complex():
    # Complex CSV (quoted, commas, newlines, empty, numbers, booleans)
    csv = 'Name,Age,Note\n"Doe, John",30,"Line1\nLine2"\n"Smith",,true\n"O\"Connor",25,null'
    dss_obj = csv_to_dss(csv, 'People')
    print('Complex CSV to DSS:', serialize_dss(dss_obj))
    print('DSS to CSV:', dss_to_csv(dss_obj))

    # Complex TSV (tab separated)
    tsv = 'A\tB\tC\n1\t2\t3\n"x\ty"\t4\t5'
    # Convert TSV to CSV for test
    csv_from_tsv = tsv.replace('\t', ',')
    dss_obj_tsv = csv_to_dss(csv_from_tsv, 'TSVSheet')
    print('Complex TSV to DSS:', serialize_dss(dss_obj_tsv))
    print('DSS to CSV (from TSV):', dss_to_csv(dss_obj_tsv))

    # Complex XLSX XML (multiple rows, empty cells, numbers, strings)
    xlsx_xml = '''<worksheet><sheetData>
    <row><c><v>Header1</v></c><c><v>Header2</v></c><c><v>Header3</v></c></row>
    <row><c><v>1</v></c><c><v>2.5</v></c><c><v></v></c></row>
    <row><c><v>"A,B"</v></c><c><v>"C\nD"</v></c><c><v>42</v></c></row>
    </sheetData></worksheet>'''
    dss_obj_xlsx = xlsx_to_dss(xlsx_xml)
    print('Complex XLSX XML to DSS:', serialize_dss(dss_obj_xlsx))
    print('DSS to XLSX XML:', dss_to_xlsx(dss_obj_xlsx))

if __name__ == '__main__':
    test_complex()
