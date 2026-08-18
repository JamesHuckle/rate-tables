import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import type { ExtractedDocument } from "../types";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type TextItem = { str: string; transform: number[]; width: number };

export async function readPdf(file: File): Promise<ExtractedDocument> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items
      .filter((item) => "str" in item)
      .map((item) => item as unknown as TextItem);
    const lines = new Map<number, TextItem[]>();

    for (const item of items) {
      const y = Math.round(item.transform[5] ?? 0);
      const line = lines.get(y) ?? [];
      line.push(item);
      lines.set(y, line);
    }

    pages.push(
      [...lines.entries()]
        .sort(([a], [b]) => b - a)
        .map(([, line]) =>
          line
            .sort((a, b) => (a.transform[4] ?? 0) - (b.transform[4] ?? 0))
            .map((item) => item.str.trim())
            .filter(Boolean)
            .join("  "),
        )
        .filter(Boolean)
        .join("\n"),
    );
  }

  const textLength = pages.reduce((total, page) => total + page.trim().length, 0);
  if (textLength < 20) {
    throw new Error(`${file.name} contains no readable text. Scanned PDFs need OCR before upload.`);
  }

  return { name: file.name, pages };
}
