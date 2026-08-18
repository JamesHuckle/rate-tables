import { ArrowCounterClockwise, GithubLogo, Sparkle } from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";

import { UploadPanel } from "./components/UploadPanel";
import { Workspace } from "./components/Workspace";
import { examplePackage } from "./data/example";
import { extractRateTables } from "./lib/extract";
import { validateFiles } from "./lib/fileValidation";
import type { RateTablePackage } from "./types";

export default function App() {
  const [ratePackage, setRatePackage] = useState<RateTablePackage | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("Reading your PDFs");
  const controller = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setRatePackage(null);
    setFiles([]);
    setError(null);
    setLoading(false);
    setStage("Reading your PDFs");
  }, []);

  const handleFiles = useCallback(async (incoming: File[]) => {
    const validation = validateFiles(incoming);
    if (validation) {
      setError(validation);
      return;
    }
    const abortController = new AbortController();
    controller.current?.abort();
    controller.current = abortController;
    setFiles(incoming);
    setError(null);
    setLoading(true);
    setStage("Reading your PDFs");
    try {
      const { readPdf } = await import("./lib/pdf");
      const documents = await Promise.all(incoming.map(readPdf));
      if (abortController.signal.aborted) return;
      setStage("Structuring rates and rules");
      const result = await extractRateTables(documents, abortController.signal);
      if (abortController.signal.aborted) return;
      setRatePackage(result);
    } catch (cause) {
      if (abortController.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "The PDFs could not be extracted.");
    } finally {
      if (!abortController.signal.aborted) setLoading(false);
      if (controller.current === abortController) controller.current = null;
    }
  }, []);

  const loadExample = useCallback(() => {
    setError(null);
    setFiles([]);
    setRatePackage(structuredClone(examplePackage));
  }, []);

  return (
    <div className="app-shell">
      <header className="masthead">
        <a className="brand" href="/" aria-label="Rate tables home" onClick={(event) => { event.preventDefault(); reset(); }}>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Rate tables</span>
        </a>
        <div className="masthead-actions">
          <span className="made-with"><Sparkle size={14} weight="fill" /> Document intelligence</span>
          <a className="icon-button" href="https://github.com/JamesHuckle/rate-tables" aria-label="View source on GitHub"><GithubLogo size={19} /></a>
          {ratePackage ? <button className="button secondary compact" type="button" onClick={reset}><ArrowCounterClockwise size={15} />New extraction</button> : null}
        </div>
      </header>

      {ratePackage ? (
        <Workspace ratePackage={ratePackage} onReset={reset} />
      ) : (
        <UploadPanel
          error={error}
          loading={loading}
          stage={stage}
          files={files}
          onFiles={(next) => void handleFiles(next)}
          onExample={loadExample}
          onCancel={reset}
        />
      )}
    </div>
  );
}
