import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import type { WeeklyReportRecord } from "@/features/weekly-reports/types";

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function createWeeklyReportPdf(report: WeeklyReportRecord) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { height } = page.getSize();
  const findings = toStringArray(report.key_findings);
  const metrics = (report.metrics as Record<string, unknown> | null) ?? {};

  let y = height - 60;

  page.drawText(report.title, {
    x: 50,
    y,
    size: 18,
    font: bold,
    color: rgb(0.05, 0.1, 0.18),
    maxWidth: 500,
  });
  y -= 28;
  page.drawText(
    `Week: ${report.report_week_start} to ${report.report_week_end}`,
    {
      x: 50,
      y,
      size: 11,
      font,
      color: rgb(0.32, 0.36, 0.42),
    },
  );
  y -= 28;
  page.drawText("Executive Summary", { x: 50, y, size: 13, font: bold });
  y -= 20;
  page.drawText(report.executive_summary ?? "-", {
    x: 50,
    y,
    size: 11,
    font,
    lineHeight: 15,
    maxWidth: 500,
  });
  y -= 110;
  page.drawText("Key Findings", { x: 50, y, size: 13, font: bold });
  y -= 20;

  for (const finding of findings.slice(0, 5)) {
    page.drawText(`- ${finding}`, {
      x: 60,
      y,
      size: 11,
      font,
      maxWidth: 490,
    });
    y -= 18;
  }

  y -= 12;
  page.drawText("Statistics", { x: 50, y, size: 13, font: bold });
  y -= 20;
  page.drawText(`Total actions: ${String(metrics.totalActions ?? 0)}`, {
    x: 60,
    y,
    size: 11,
    font,
  });
  y -= 16;
  page.drawText(`Published actions: ${String(metrics.publishedCount ?? 0)}`, {
    x: 60,
    y,
    size: 11,
    font,
  });
  y -= 16;
  page.drawText(
    `High impact actions: ${String(metrics.highImpactCount ?? 0)}`,
    { x: 60, y, size: 11, font },
  );

  return pdfDoc.save();
}
