'use client';

import { Download } from 'lucide-react';

interface CsvRow {
  name: string;
  email: string;
  phone: string;
  guests: number;
  status: string;
  rsvpDate: string;
}

export function ExportCsvButton({
  eventTitle,
  csvRows,
}: {
  eventTitle: string;
  csvRows: CsvRow[];
}) {
  function handleExport() {
    if (csvRows.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Guests', 'Status', 'RSVP Date'];
    const rows = csvRows.map((r) => [
      r.name,
      r.email,
      r.phone,
      String(r.guests),
      r.status,
      r.rsvpDate,
    ]);

    // Add totals row
    const totalGuests = csvRows.reduce((sum, r) => sum + r.guests, 0);
    rows.push(['', '', '', String(totalGuests), 'TOTAL HEADCOUNT', '']);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50);
    link.href = url;
    link.download = `rsvps_${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={csvRows.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors"
      style={{
        background: csvRows.length === 0 ? '#A89888' : '#6B1D2A',
        cursor: csvRows.length === 0 ? 'not-allowed' : 'pointer',
      }}
    >
      <Download size={16} />
      Export CSV
    </button>
  );
}
