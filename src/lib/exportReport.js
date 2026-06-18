import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatINR } from "@/lib/giftdata";

export async function exportReportPDF(element, name) {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#fff8fa" });
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 16;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 8;
  pdf.addImage(imgData, "JPEG", 8, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - 16;
  while (heightLeft > 0) {
    position -= pageHeight - 16;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 8, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 16;
  }
  pdf.save(`paper-plane-report-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}

export function downloadSummary(layout, occasion, products, details, totalPrice) {
  const lines = [
    "PAPER PLANE — AI GIFT BOX LAYOUT SUMMARY",
    "=".repeat(45),
    "",
    `Recipient: ${details.name || "—"}`,
    `Occasion: ${occasion.title}`,
    `Box Size: ${details.boxSize}`,
    `Products Total: ${formatINR(totalPrice)}`,
    "",
    `Layout Style: ${layout.name}`,
    `Match Score: ${layout.matchScore}%`,
    `Ribbon Color: ${layout.ribbon.color}`,
    `Packaging: ${layout.packaging}`,
    "",
    "SELECTED PRODUCTS:",
    ...products.map((p) => `  • ${p.name} (${p.size}) — ${formatINR(p.price)}`),
    "",
    "ARRANGEMENT INSTRUCTIONS:",
    ...layout.instructions.map((s, i) => `  ${i + 1}. ${s}`),
    "",
    "AI EXPLANATION:",
    layout.explanation,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gift-box-layout-summary.txt";
  a.click();
  URL.revokeObjectURL(url);
}