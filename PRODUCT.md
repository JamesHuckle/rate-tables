# Product

## Purpose

Rate tables turns benefit-pricing PDFs into a reviewable pricing model. A benefits operator can inspect exact rates and eligibility rules, trace decisions to source pages, test representative employee profiles, and understand the resulting employer and employee cost.

## Users and job

Benefits, reward, and implementation teams use the app when translating policy documents into configuration. Success means they can distinguish extracted source truth from assumptions and explain why a choice is available, unavailable, or needs more information.

## Product principles

- Keep every extracted decision connected to its source.
- Separate probabilistic document extraction from deterministic evaluation.
- Preserve uncertainty instead of manufacturing precision.
- Explain restrictions and cost derivation at the point of use.
- Keep example data visibly labelled as synthetic.

## Constraints

- Source PDF text is read in the browser; only extracted text is sent to the serverless extraction endpoint.
- Scanned PDFs require OCR before upload.
- The application does not persist uploaded documents or extracted packages.
- Pricing evaluation executes only the declarative schema; model output never runs as code.
- Money carries an explicit currency and billing period.

## Accessibility

The complete workflow supports keyboard use, visible focus, labelled scroll regions, semantic tables and fields, and status text that does not rely on colour alone.
