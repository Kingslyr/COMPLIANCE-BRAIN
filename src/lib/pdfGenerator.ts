import { jsPDF } from "jspdf";
import type { ComplianceReport } from "./supabase";

export async function pdf(report: ComplianceReport) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const data = report.report_data;
  const W = 210;
  const margin = 20;
  const contentW = W - margin * 2;
  let y = 0;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkY = (needed = 20) => { if (y + needed > 270) addPage(); };

  // Header bar
  doc.setFillColor(29, 73, 208);
  doc.rect(0, 0, W, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Compliance Brain", margin, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("AI-Powered Compliance Report", margin, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, margin, 32);

  y = 55;

  // Report title
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(report.title, margin, y);
  y += 8;

  if (data.company_name) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(data.company_name, margin, y);
    y += 6;
  }

  // Industry + Country pills
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(margin, y, 35, 7, 2, 2, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216);
  doc.text(data.industry, margin + 4, y + 4.5);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin + 38, y, 35, 7, 2, 2, "FD");
  doc.setTextColor(22, 101, 52);
  doc.text(data.country, margin + 42, y + 4.5);
  y += 14;

  // Summary
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentW, 24, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Executive Summary", margin + 4, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(data.summary || "", contentW - 8);
  doc.text(summaryLines, margin + 4, y + 14);
  y += summaryLines.length * 4.5 + 14;

  // Sections
  for (const section of data.sections || []) {
    checkY(30);

    // Section header
    doc.setFillColor(29, 73, 208);
    doc.rect(margin, y, contentW, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(section.category, margin + 4, y + 6);
    y += 13;

    for (const reg of section.regulations || []) {
      checkY(30);

      // Status color
      const statusColor =
        reg.status === "compliant" ? [22, 163, 74] :
        reg.status === "non-compliant" ? [220, 38, 38] :
        [217, 119, 6];

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentW, 26, 2, 2, "FD");

      // Status dot
      doc.setFillColor(...statusColor as [number,number,number]);
      doc.circle(margin + 4, y + 7, 2, "F");

      // Reg title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(reg.title, margin + 9, y + 7);

      // Reference
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Ref: ${reg.reference}`, margin + 9, y + 12);

      // Requirement
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const reqLines = doc.splitTextToSize(reg.requirement, contentW - 16);
      doc.text(reqLines, margin + 9, y + 18);

      y += reqLines.length * 3.5 + 20;
      if (y > 265) addPage();
    }
    y += 4;
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 283, W, 14, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Compliance Brain — AI-Powered Compliance Assistant", margin, 291);
    doc.text(`Page ${i} of ${pageCount}`, W - margin, 291, { align: "right" });
  }

  doc.save(`${report.title.replace(/\s+/g, "_")}.pdf`);
}
