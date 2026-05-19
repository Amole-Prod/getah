import { NextResponse } from "next/server";

import { createWeeklyReportPdf } from "@/features/weekly-reports/pdf";
import { getPublishedWeeklyReportBySlug } from "@/features/weekly-reports/repository";

type WeeklyReportPdfRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  { params }: WeeklyReportPdfRouteProps,
) {
  const { slug } = await params;
  const report = await getPublishedWeeklyReportBySlug(slug);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const pdfBytes = await createWeeklyReportPdf(report);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "content-disposition": `inline; filename="${report.slug}.pdf"`,
      "content-type": "application/pdf",
    },
  });
}
