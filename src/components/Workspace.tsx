import {
  ArrowSquareOut,
  CaretDown,
  Check,
  CheckCircle,
  Clipboard,
  FilePdf,
  Info,
  PencilSimple,
  Prohibit,
  WarningCircle,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { personas as builtInPersonas } from "../data/example";
import { evaluate, initialSelections } from "../lib/evaluator";
import type {
  Citation,
  ConfigurationInput,
  Evaluation,
  Persona,
  RateTablePackage,
  RateTableRule,
  Scalar,
} from "../types";

type Tab = "table" | "rules" | "schema";

interface WorkspaceProps {
  ratePackage: RateTablePackage;
  onReset: () => void;
}

export function Workspace({ ratePackage, onReset }: WorkspaceProps) {
  const [personas, setPersonas] = useState(() => structuredClone(builtInPersonas));
  const [personaId, setPersonaId] = useState(personas[0]?.id ?? "");
  const [selections, setSelections] = useState(() => initialSelections(ratePackage));
  const [tab, setTab] = useState<Tab>("table");
  const persona = personas.find((item) => item.id === personaId) ?? personas[0]!;
  const result = useMemo(
    () => evaluate(ratePackage, persona, selections),
    [ratePackage, persona, selections],
  );

  function updatePersona(field: keyof Persona, value: string | number | boolean) {
    setPersonas((current) => current.map((item) => item.id === persona.id ? { ...item, [field]: value } : item));
  }

  return (
    <main className="workspace">
      <section className="source-strip" aria-label="Active source documents">
        <div className="source-summary">
          <span className="source-icon"><FilePdf size={18} weight="duotone" /></span>
          <div>
            <strong>{ratePackage.title}</strong>
            <span>{ratePackage.rate_tables.length} {plural(ratePackage.rate_tables.length, "table")} · {ratePackage.rules.length} {plural(ratePackage.rules.length, "rule")}</span>
          </div>
        </div>
        <div className="source-files">
          {ratePackage.sources.map((source) => (
            <span className="file-chip" key={source.id} title={source.filename}><FilePdf size={14} />{source.filename}<small>{source.page_count}p</small></span>
          ))}
        </div>
        <button className="text-button" type="button" onClick={onReset}>Replace source</button>
      </section>

      {ratePackage.warnings.length ? <Warnings warnings={ratePackage.warnings} /> : null}

      <section className="persona-strip" aria-labelledby="scenario-title">
        <div className="section-heading-inline">
          <div><span className="step-label">01</span><div><h2 id="scenario-title">Test a person</h2><p>Profile facts are matched against extracted eligibility and rate bands.</p></div></div>
          <details className="persona-editor">
            <summary><PencilSimple size={15} />Edit details<CaretDown size={14} /></summary>
            <div className="persona-popover">
              <div className="popover-heading"><strong>{persona.name}</strong><span>Changes apply to this scenario only.</span></div>
              <label>Age<input type="number" min="16" max="120" value={persona.age} onChange={(event) => updatePersona("age", Number(event.target.value))} /></label>
              <label>Annual salary<input type="number" min="0" value={persona.salary} onChange={(event) => updatePersona("salary", Number(event.target.value))} /></label>
              <label>Service in months<input type="number" min="0" value={persona.tenure_months} onChange={(event) => updatePersona("tenure_months", Number(event.target.value))} /></label>
              <label>Employment<select value={persona.employment_type} onChange={(event) => updatePersona("employment_type", event.target.value)}><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contractor">Contractor</option></select></label>
            </div>
          </details>
        </div>
        <div className="persona-list" role="list" aria-label="Example personas">
          {personas.map((item) => (
            <button
              type="button"
              role="listitem"
              className={`persona-card${item.id === persona.id ? " is-selected" : ""}`}
              key={item.id}
              onClick={() => setPersonaId(item.id)}
              aria-pressed={item.id === persona.id}
            >
              <span className="avatar">{initials(item.name)}</span>
              <span className="persona-copy"><strong>{item.name}</strong><small>{item.age} years · {humanize(item.employment_type)} · {money(item.salary, item.salary_currency, 0)}/yr</small></span>
              {item.id === persona.id ? <CheckCircle className="selected-check" size={19} weight="fill" /> : null}
            </button>
          ))}
        </div>
      </section>

      <div className="work-grid">
        <section className="review-pane" aria-labelledby="review-title">
          <div className="pane-heading">
            <div className="step-heading"><span className="step-label">02</span><div><h2 id="review-title">Review the model</h2><p>Every extracted value remains connected to its source.</p></div></div>
          </div>
          <div className="tabs" role="tablist" aria-label="Extracted model views">
            <button role="tab" aria-selected={tab === "table"} onClick={() => setTab("table")}>Rate table <span>{ratePackage.rate_tables.length}</span></button>
            <button role="tab" aria-selected={tab === "rules"} onClick={() => setTab("rules")}>Rules <span>{ratePackage.rules.length}</span></button>
            <button role="tab" aria-selected={tab === "schema"} onClick={() => setTab("schema")}>Output schema</button>
          </div>
          {tab === "table" ? <TableView ratePackage={ratePackage} result={result} /> : null}
          {tab === "rules" ? <RulesView rules={ratePackage.rules} /> : null}
          {tab === "schema" ? <SchemaView ratePackage={ratePackage} /> : null}
        </section>

        <aside className="configuration-pane" aria-labelledby="configure-title">
          <div className="pane-heading">
            <div className="step-heading"><span className="step-label">03</span><div><h2 id="configure-title">Configure benefit</h2><p>Unavailable choices carry the source reason.</p></div></div>
          </div>
          <ConfigurationForm
            ratePackage={ratePackage}
            result={result}
            selections={selections}
            onChange={(id, value) => setSelections((current) => ({ ...current, [id]: value }))}
          />
          <CostSummary ratePackage={ratePackage} result={result} benefitSelected={Boolean(selections.benefit_selected)} />
        </aside>
      </div>
    </main>
  );
}

function Warnings({ warnings }: { warnings: RateTablePackage["warnings"] }) {
  const hasWarning = warnings.some((warning) => warning.severity !== "info");
  return (
    <details className={`warning-bar${hasWarning ? " is-warning" : ""}`}>
      <summary>
        {hasWarning ? <WarningCircle size={17} weight="fill" /> : <Info size={17} weight="fill" />}
        <span>{hasWarning ? "Review extraction notes" : "About this source"}</span>
        <small>{warnings.length} {plural(warnings.length, "note")}</small>
        <CaretDown className="warning-caret" size={15} />
      </summary>
      <div className="warning-content">
        {warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}>{warning.message}</p>)}
      </div>
    </details>
  );
}

function TableView({ ratePackage, result }: { ratePackage: RateTablePackage; result: Evaluation }) {
  const matchedIds = new Set(result.cost?.breakdown.map((item) => item.source_id) ?? []);
  if (!ratePackage.rate_tables.length) return <Empty title="No rate table found" body="The source did not contain a distinguishable pricing table." />;
  return <div className="tables-stack">{ratePackage.rate_tables.map((table) => (
    <article className="rate-table-block" key={table.id}>
      <div className="table-title-row">
        <div><h3>{table.name}</h3><p>{table.description || `${humanize(table.billing_period)} pricing in ${table.currency}.`}</p></div>
        <CitationLink citations={table.citations} compact />
      </div>
      {table.calculation ? (
        <div className="formula-card"><span>Calculation</span><strong>({humanize(table.calculation.input_id)} × {table.calculation.multiplier}) ÷ {table.calculation.divisor}</strong><small>Charged to {table.calculation.payer} · rounded to {table.calculation.rounding_places} places</small></div>
      ) : (
        <div className="table-scroll" role="region" aria-label={`${table.name} — scroll horizontally to see all columns`} tabIndex={0}>
          <table>
            <thead><tr>{table.dimensions.map((dimension) => <th key={dimension}>{humanize(dimension.replace("persona.", ""))}</th>)}<th>Employer</th><th>Employee</th><th>Total</th><th><span className="visually-hidden">Source</span></th></tr></thead>
            <tbody>{table.rows.map((row) => { const matched = matchedIds.has(`${table.id}:${row.id}`); return <tr className={matched ? "is-matched" : ""} key={row.id}>{table.dimensions.map((dimension) => <td key={dimension}>{selectorLabel(row, dimension)}</td>)}<td className="numeric">{money(row.employer_cost, table.currency)}</td><td className="numeric">{money(row.employee_cost, table.currency)}</td><td className="numeric total-cell">{money(row.employer_cost + row.employee_cost + row.unallocated_cost, table.currency)}</td><td><span className="matched-label">{matched ? "Matched" : ""}</span><CitationLink citations={row.citations} compact /></td></tr>; })}</tbody>
          </table>
        </div>
      )}
    </article>
  ))}</div>;
}

function RulesView({ rules }: { rules: RateTableRule[] }) {
  if (!rules.length) return <Empty title="No rules extracted" body="The source did not contain explicit eligibility or pricing rules." />;
  return <div className="rules-list">{rules.map((rule) => (
    <article className="rule-row" key={rule.id}>
      <span className={`rule-effect effect-${rule.effect.type}`}>{humanize(rule.effect.type)}</span>
      <div><h3>{rule.name}</h3><p>{rule.reason}</p><small>When {conditionSummary(rule.condition)}</small></div>
      <CitationLink citations={rule.citations} compact />
    </article>
  ))}</div>;
}

function SchemaView({ ratePackage }: { ratePackage: RateTablePackage }) {
  const [copied, setCopied] = useState(false);
  const output = JSON.stringify(ratePackage, null, 2);
  return <div className="schema-view"><div className="schema-toolbar"><span>rate-table-package.json</span><button className="button secondary compact" type="button" onClick={() => { void navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy JSON"}</button></div><pre><code>{output}</code></pre></div>;
}

function ConfigurationForm({ ratePackage, result, selections, onChange }: {
  ratePackage: RateTablePackage;
  result: Evaluation;
  selections: Record<string, Scalar>;
  onChange: (id: string, value: Scalar) => void;
}) {
  const selectionInput = ratePackage.inputs.find((input) => input.purpose === "benefit_selection");
  const selected = selectionInput ? selections[selectionInput.id] === true : true;
  const configuration = ratePackage.inputs.filter((input) => input.purpose !== "benefit_selection");
  return <div className="configuration-form">
    {selectionInput ? <fieldset className="field-group"><legend>{selectionInput.label}</legend><p>{selectionInput.description}</p><div className="binary-control"><button type="button" className={selected ? "is-selected" : ""} onClick={() => onChange(selectionInput.id, true)}><CheckCircle size={18} weight={selected ? "fill" : "regular"} />Select</button><button type="button" className={!selected ? "is-selected" : ""} onClick={() => onChange(selectionInput.id, false)}><Prohibit size={18} weight={!selected ? "fill" : "regular"} />Decline</button></div></fieldset> : null}
    {selected ? configuration.map((input) => <ConfigurationField key={input.id} input={input} evaluated={result.inputs.find((item) => item.input_id === input.id)} value={selections[input.id] ?? null} onChange={(value) => onChange(input.id, value)} />) : <div className="declined-state"><Prohibit size={19} /><div><strong>Benefit declined</strong><p>Configuration is paused and the resulting cost is zero.</p></div></div>}
  </div>;
}

function ConfigurationField({ input, evaluated, value, onChange }: {
  input: ConfigurationInput;
  evaluated: Evaluation["inputs"][number] | undefined;
  value: Scalar;
  onChange: (value: Scalar) => void;
}) {
  const reason = evaluated?.reasons[0];
  return <div className={`field-group${evaluated?.state === "disallowed" ? " has-error" : ""}`}>
    <label htmlFor={`input-${input.id}`}>{input.label}{input.required ? <span aria-hidden="true">*</span> : null}</label>
    {input.description ? <p>{input.description}</p> : null}
    {input.kind === "enum" ? <select id={`input-${input.id}`} value={String(value ?? "")} onChange={(event) => { const option = input.options.find((item) => String(item.value) === event.target.value); onChange(option?.value ?? event.target.value); }}><option value="" disabled>Choose an option</option>{input.options.map((option) => { const state = evaluated?.options.find((item) => item.value === option.value); return <option key={String(option.value)} value={String(option.value)} disabled={state?.state === "disallowed"}>{option.label}{state?.state === "disallowed" ? " — unavailable" : ""}</option>; })}</select> : null}
    {input.kind === "number" ? <input id={`input-${input.id}`} type="number" value={value === null ? "" : Number(value)} min={input.minimum ?? undefined} max={input.maximum ?? undefined} step={input.step ?? undefined} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} /> : null}
    {input.kind === "date" ? <input id={`input-${input.id}`} type="date" value={String(value ?? "")} onChange={(event) => onChange(event.target.value || null)} /> : null}
    {input.kind === "boolean" ? <select id={`input-${input.id}`} value={String(value ?? "")} onChange={(event) => onChange(event.target.value === "true")}><option value="">Choose</option><option value="true">Yes</option><option value="false">No</option></select> : null}
    {reason ? <span className="field-reason"><WarningCircle size={14} />{reason}</span> : null}
  </div>;
}

function CostSummary({ ratePackage, result, benefitSelected }: { ratePackage: RateTablePackage; result: Evaluation; benefitSelected: boolean }) {
  const cost = result.cost;
  const total = cost?.total_cost ?? 0;
  const breakdown = cost ? aggregateBreakdown(cost.breakdown) : [];
  return <div className={`cost-summary status-${result.status}`}>
    <div className="cost-heading"><div><span>Final cost</span><strong>{money(total, cost?.currency ?? "GBP")}</strong><small>per {cost?.billing_period ?? "month"}</small></div><span className="status-badge">{statusLabel(result.status, benefitSelected)}</span></div>
    <dl><div><dt>Employer</dt><dd>{money(cost?.employer_cost ?? 0, cost?.currency ?? "GBP")}</dd></div><div><dt>Employee</dt><dd>{money(cost?.employee_cost ?? 0, cost?.currency ?? "GBP")}</dd></div>{cost?.unallocated_cost ? <div><dt>Unallocated</dt><dd>{money(cost.unallocated_cost, cost.currency)}</dd></div> : null}</dl>
    {benefitSelected && breakdown.length ? <details className="cost-trace"><summary><CheckCircle size={14} />How this was calculated<CaretDown size={13} /></summary><ul>{breakdown.map((item) => <li key={item.source_id}><span><strong>{item.label}</strong><small>{breakdownRole(item.source_id, ratePackage)}</small></span><span className="trace-value">{item.amount >= 0 ? "+" : "−"}{money(Math.abs(item.amount), cost?.currency ?? "GBP")}</span><CitationLink citations={breakdownCitations(item.source_id, ratePackage)} compact /></li>)}</ul></details> : null}
    {result.messages.length ? <details className="cost-messages"><summary><WarningCircle size={14} />{result.messages.length} evaluation {plural(result.messages.length, "note")}<CaretDown size={13} /></summary><ul>{[...new Set(result.messages.map((message) => message.message))].map((message) => <li key={message}>{message}</li>)}</ul></details> : null}
  </div>;
}

function CitationLink({ citations, compact = false }: { citations: Citation[]; compact?: boolean }) {
  const first = citations[0];
  if (!first) return null;
  return <details className="citation"><summary title={`${first.source_name}, page ${first.page_number}`}><ArrowSquareOut size={compact ? 14 : 15} />{compact ? <span className="visually-hidden">View source citation</span> : `Page ${first.page_number}`}</summary><div className="citation-popover"><strong>{first.source_name} · page {first.page_number}</strong><p>{first.excerpt || "No source excerpt was captured."}</p></div></details>;
}

function Empty({ title, body }: { title: string; body: string }) {
  return <div className="empty-state"><Info size={20} /><div><strong>{title}</strong><p>{body}</p></div></div>;
}

function selectorLabel(row: RateTablePackage["rate_tables"][number]["rows"][number], dimension: string) {
  if (dimension in row.selectors) return humanize(String(row.selectors[dimension]));
  const condition = row.selector_conditions.find((item) => item.field === dimension);
  if (!condition) return "—";
  if (condition.op === "between") return `${condition.values[0]}–${condition.values[1]}`;
  const operators: Record<string, string> = { gte: "≥", gt: ">", lte: "≤", lt: "<", neq: "≠", eq: "=" };
  return `${operators[condition.op] ?? humanize(condition.op)} ${condition.value}`;
}

function conditionSummary(condition: RateTableRule["condition"]): string {
  if (condition.op === "all" || condition.op === "any") return condition.conditions.map(conditionSummary).join(condition.op === "all" ? " and " : " or ");
  if (condition.op === "not") return `not ${condition.conditions[0] ? conditionSummary(condition.conditions[0]) : "the condition"}`;
  const operators: Record<string, string> = { eq: "equals", neq: "does not equal", in: "is one of", not_in: "is not one of", gt: "is greater than", gte: "is at least", lt: "is less than", lte: "is at most", between: "is between", exists: "is provided" };
  const value = condition.values.length ? condition.values.join(condition.op === "between" ? " and " : ", ") : String(condition.value ?? "");
  return `${humanize((condition.field ?? "value").replace("persona.", ""))} ${operators[condition.op] ?? humanize(condition.op)} ${value}`.trim();
}

function money(value: number, currency = "GBP", digits = 2) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}
function humanize(value: string) { const output = value.replaceAll("_", " "); return output.charAt(0).toUpperCase() + output.slice(1); }
function initials(value: string) { return value.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(); }
function plural(count: number, word: string) { return count === 1 ? word : `${word}s`; }
function statusLabel(status: Evaluation["status"], selected: boolean) { if (!selected) return "Declined"; if (status === "allowed") return "Available"; if (status === "disallowed") return "Unavailable"; return "Needs review"; }

function aggregateBreakdown(items: NonNullable<Evaluation["cost"]>["breakdown"]) {
  const grouped = new Map<string, { source_id: string; label: string; amount: number }>();
  for (const item of items) {
    const current = grouped.get(item.source_id);
    if (current) current.amount += item.amount;
    else grouped.set(item.source_id, { ...item });
  }
  return [...grouped.values()];
}

function breakdownCitations(sourceId: string, ratePackage: RateTablePackage): Citation[] {
  const separator = sourceId.indexOf(":");
  if (separator >= 0) {
    const table = ratePackage.rate_tables.find((item) => item.id === sourceId.slice(0, separator));
    return table?.rows.find((row) => row.id === sourceId.slice(separator + 1))?.citations ?? table?.citations ?? [];
  }
  return ratePackage.rules.find((rule) => rule.id === sourceId)?.citations ?? [];
}

function breakdownRole(sourceId: string, ratePackage: RateTablePackage): string {
  const separator = sourceId.indexOf(":");
  if (separator >= 0) {
    return ratePackage.rate_tables.find((item) => item.id === sourceId.slice(0, separator))?.name ?? "Matched rate";
  }
  return ratePackage.rules.find((rule) => rule.id === sourceId) ? "Applied pricing rule" : "Cost adjustment";
}
