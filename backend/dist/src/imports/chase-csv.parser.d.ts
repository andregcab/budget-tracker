export interface ParsedRow {
    date: Date;
    description: string;
    amount: string;
    type: string;
    balance?: string;
    category?: string;
}
export declare function parseChaseCsv(csvContent: string): ParsedRow[];
export declare function externalId(accountId: string, row: ParsedRow): string;
