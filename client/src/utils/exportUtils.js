import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Excel export ──────────────────────────────────────────────
export function exportToExcel(rows, columns, sheetName, fileName) {
  const data = rows.map((r) => {
    const obj = {};
    columns.forEach(({ header, key }) => { obj[header] = r[key] ?? ''; });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// ── PDF export ────────────────────────────────────────────────
export function exportToPDF(title, subtitle, sections, fileName) {
  const doc = new jsPDF();
  let y = 14;

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, y);
  y += 7;

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(subtitle, 14, y);
    doc.setTextColor(0);
    y += 7;
  }

  sections.forEach(({ heading, stats, columns, rows }) => {
    y += 4;
    if (heading) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(heading, 14, y);
      y += 5;
    }

    // Stat summary row (key-value pairs)
    if (stats) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      stats.forEach(({ label, value }) => {
        doc.text(`${label}: ${value}`, 14, y);
        y += 5;
      });
      y += 2;
    }

    // Table
    if (columns && rows) {
      autoTable(doc, {
        startY: y,
        head: [columns.map((c) => c.header)],
        body: rows.map((r) => columns.map((c) => r[c.key] ?? '')),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [249, 115, 22] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  });

  doc.save(`${fileName}.pdf`);
}
