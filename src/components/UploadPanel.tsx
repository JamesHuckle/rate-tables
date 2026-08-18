import { ArrowRight, FilePdf, ShieldCheck, UploadSimple, X } from "@phosphor-icons/react";
import { useId, useState } from "react";

const MAX_FILES = 5;

interface UploadPanelProps {
  error: string | null;
  loading: boolean;
  stage: string;
  files: File[];
  onFiles: (files: File[]) => void;
  onExample: () => void;
  onCancel: () => void;
}

export function UploadPanel({ error, loading, stage, files, onFiles, onExample, onCancel }: UploadPanelProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  function accept(list: FileList | null) {
    const next = [...(list ?? [])];
    if (!next.length) return;
    const invalid = next.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (invalid) return onFiles(next);
    onFiles(next.slice(0, MAX_FILES));
  }

  if (loading) {
    return (
      <main className="landing-main">
        <section className="processing-panel" aria-live="polite" aria-busy="true">
          <div className="processing-orbit" aria-hidden="true">
            <FilePdf weight="duotone" size={26} />
          </div>
          <div>
            <p className="kicker">Document workspace</p>
            <h1>{stage}</h1>
            <p className="lede">Preserving source pages, table values and eligibility language as a reviewable model.</p>
          </div>
          <div className="progress-track" aria-hidden="true"><span /></div>
          <div className="processing-files">
            {files.map((file) => (
              <span key={`${file.name}-${file.lastModified}`}><FilePdf size={15} />{file.name}</span>
            ))}
          </div>
          <button className="button secondary" type="button" onClick={onCancel}><X size={16} />Cancel</button>
        </section>
      </main>
    );
  }

  return (
    <main className="landing-main">
      <section className="intro-grid">
        <div className="intro-copy">
          <p className="kicker">Document-to-decision workspace</p>
          <h1>Make every rate<br />traceable.</h1>
          <p className="lede">Turn benefit pricing PDFs into reviewable tables, rules and employee cost scenarios.</p>
          <div className="trust-note"><ShieldCheck size={18} weight="duotone" /><span>PDF text is read in your browser. Only extracted text is sent for structuring.</span></div>
        </div>

        <div className="upload-composition">
          <div
            className={`drop-zone${dragging ? " is-dragging" : ""}${error ? " is-invalid" : ""}`}
            onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }}
            onDrop={(event) => { event.preventDefault(); setDragging(false); accept(event.dataTransfer.files); }}
          >
            <div className="upload-icon"><UploadSimple size={23} weight="bold" /></div>
            <h2>Drop policy PDFs here</h2>
            <p>Up to five text-based PDFs, 20 MB each.</p>
            <label className="button primary" htmlFor={inputId}>Choose PDFs <ArrowRight size={16} weight="bold" /></label>
            <input
              id={inputId}
              className="visually-hidden"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(event) => accept(event.target.files)}
            />
          </div>
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          <button className="example-link" type="button" onClick={onExample}>
            <span>Not holding a policy PDF?</span>
            <strong>Open the worked example <ArrowRight size={14} /></strong>
          </button>
        </div>
      </section>
    </main>
  );
}
