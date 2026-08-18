const MAX_FILES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export function validateFiles(files: File[]): string | null {
  if (!files.length) return "Choose at least one PDF.";
  if (files.length > MAX_FILES) return "You can extract up to five PDFs at once.";
  const invalid = files.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
  if (invalid) return `${invalid.name} is not a PDF.`;
  const large = files.find((file) => file.size > MAX_FILE_SIZE);
  if (large) return `${large.name} is larger than 20 MB.`;
  return null;
}
