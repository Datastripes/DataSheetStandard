import sys
from dss import parse_dss, serialize_dss, csv_to_dss, dss_to_csv, xlsx_to_dss, dss_to_xlsx

def test():
    dss_sample = '---\nproject: Test\n---\n[Sheet1]\n@ A1\n"A","B"\n1,2\n'
    dss_obj = parse_dss(dss_sample)
    dss_str = serialize_dss(dss_obj)
    print('DSS parse/serialize roundtrip:', 'PASS' if dss_str == dss_sample else 'FAIL')

    csv = 'A,B\n1,2'
    dss_from_csv = csv_to_dss(csv, 'Sheet1')
    csv_from_dss = dss_to_csv(dss_from_csv)
    print('CSV <-> DSS:', 'PASS' if csv_from_dss.strip() == csv.strip() else 'FAIL')

    fake_xlsx = '<worksheet><sheetData><row><c><v>A</v></c><c><v>B</v></c></row><row><c><v>1</v></c><c><v>2</v></c></row></sheetData></worksheet>'
    dss_from_xlsx = xlsx_to_dss(fake_xlsx)
    xlsx_from_dss = dss_to_xlsx(dss_from_xlsx)
    print('XLSX <-> DSS (minimal XML):', 'PASS' if '<worksheet>' in xlsx_from_dss else 'FAIL')
    print('All tests completed.')

if __name__ == '__main__':
    test()
