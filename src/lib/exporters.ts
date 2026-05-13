import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportXlsx(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function exportPdf(
  title: string,
  filename: string,
  head: string[],
  body: (string | number)[][],
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  autoTable(doc, {
    startY: 60,
    head: [head],
    body,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [31, 111, 74], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 250, 247] },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
