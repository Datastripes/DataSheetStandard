// TypeScript type definitions for dss-js
/**
 * DSS Sheet Anchor
 */
export interface DSSAnchor {
  coord: string; // e.g. "A1"
  data: string[][]; // 2D array of cell values
}

/**
 * DSS Sheet
 */
export interface DSSSheet {
  anchors: DSSAnchor[];
  name: string;
  data: string[][]; // 2D array of cell values
}

/**
 * DSS File Object
 */
export interface DSSFile {
  metadata?: Record<string, string>;
  sheets: Record<string, DSSSheet>;
}

export declare function parseDSS(dssText: string): DSSFile;
export declare function serializeDSS(dssObj: DSSFile): string;
export declare function csvToDSS(csvText: string, sheetName?: string): DSSFile;
export declare function dssToCSV(dssObj: DSSFile): string;
export declare function xlsxToDSS(xlsxData: string | ArrayBuffer): DSSFile;
export declare function dssToXLSX(dssObj: DSSFile): string;
