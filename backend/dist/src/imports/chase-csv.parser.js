"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChaseCsv = parseChaseCsv;
exports.externalId = externalId;
const sync_1 = require("csv-parse/sync");
const HEADER_ALIASES = {
    date: 'date',
    'post date': 'date',
    description: 'description',
    details: 'description',
    transaction: 'description',
    amount: 'amount',
    type: 'type',
    balance: 'balance',
    category: 'category',
};
function normalizeHeader(h) {
    return HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase();
}
function parseAmount(value) {
    const cleaned = value.replace(/[$,]/g, '').trim();
    const num = parseFloat(cleaned);
    if (Number.isNaN(num))
        return '0';
    return num.toFixed(2);
}
function parseDate(value) {
    const d = new Date(value.trim());
    if (Number.isNaN(d.getTime())) {
        throw new Error(`Invalid date: ${value}`);
    }
    return d;
}
function parseChaseCsv(csvContent) {
    const rows = (0, sync_1.parse)(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
    });
    if (rows.length === 0)
        return [];
    const rawHeaders = Object.keys(rows[0]);
    const colMap = {};
    rawHeaders.forEach((h) => {
        const norm = normalizeHeader(h);
        colMap[norm] = h;
    });
    const dateCol = colMap.date ?? colMap['post date'];
    const descCol = colMap.description ?? colMap.details ?? colMap.transaction;
    const amountCol = colMap.amount;
    if (!dateCol || !descCol || !amountCol) {
        throw new Error('CSV must have columns: Date (or Post Date), Description (or Details), Amount');
    }
    const typeCol = colMap.type;
    const balanceCol = colMap.balance;
    const categoryCol = colMap.category;
    const result = [];
    for (const row of rows) {
        const dateStr = row[dateCol];
        const description = (row[descCol] ?? '').trim() || 'Unknown';
        const amountStr = row[amountCol];
        if (!dateStr || amountStr === undefined || amountStr === '')
            continue;
        try {
            result.push({
                date: parseDate(dateStr),
                description,
                amount: parseAmount(amountStr),
                type: typeCol ? (row[typeCol] ?? '').trim() : '',
                balance: balanceCol ? row[balanceCol] : undefined,
                category: categoryCol ? (row[categoryCol] ?? '').trim() : undefined,
            });
        }
        catch {
        }
    }
    return result;
}
function externalId(accountId, row) {
    const str = `${accountId}|${row.date.toISOString().slice(0, 10)}|${row.description}|${row.amount}`;
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
    }
    return `ext-${Math.abs(h).toString(36)}`;
}
//# sourceMappingURL=chase-csv.parser.js.map