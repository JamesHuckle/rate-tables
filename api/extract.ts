import { createHash } from "node:crypto";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";

const Scalar = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const Citation = z.object({
  source_name: z.string(),
  page_number: z.number().int().positive(),
  excerpt: z.string(),
});
const RuleCondition: z.ZodTypeAny = z.lazy(() =>
  z.object({
    op: z.string(),
    field: z.string().nullable(),
    value: Scalar,
    values: z.array(Scalar),
    conditions: z.array(RuleCondition),
  }),
);
const PackageSchema = z.object({
  schema_version: z.string(),
  title: z.string(),
  sources: z.array(z.object({
    id: z.string(),
    filename: z.string(),
    page_count: z.number().int().positive(),
    label: z.string(),
  })),
  inputs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    kind: z.enum(["enum", "boolean", "number", "date"]),
    purpose: z.enum(["configuration", "benefit_selection"]),
    description: z.string(),
    required: z.boolean(),
    persona_field: z.string().nullable(),
    options: z.array(z.object({
      value: Scalar,
      label: z.string(),
      description: z.string(),
      citations: z.array(Citation),
    })),
    minimum: z.number().nullable(),
    maximum: z.number().nullable(),
    step: z.number().nullable(),
    default: Scalar,
    citations: z.array(Citation),
  })),
  rate_tables: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    currency: z.string(),
    billing_period: z.enum(["month", "year", "one_off"]),
    dimensions: z.array(z.string()),
    rows: z.array(z.object({
      id: z.string(),
      label: z.string(),
      selectors: z.record(Scalar),
      selector_conditions: z.array(z.object({
        field: z.string(),
        op: z.enum(["eq", "neq", "in", "not_in", "gt", "gte", "lt", "lte", "between"]),
        value: Scalar,
        values: z.array(Scalar),
      })),
      employer_cost: z.number(),
      employee_cost: z.number(),
      unallocated_cost: z.number(),
      citations: z.array(Citation),
    })),
    calculation: z.object({
      input_id: z.string(),
      multiplier: z.number(),
      divisor: z.number(),
      payer: z.enum(["employer", "employee", "unallocated"]),
      rounding_places: z.number().int().min(0).max(6),
      citations: z.array(Citation),
    }).nullable(),
    citations: z.array(Citation),
  })),
  rules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    condition: RuleCondition,
    effect: z.object({
      type: z.enum(["exclude", "disable_option", "restrict_values", "require_input", "set_default", "add_flat_cost", "add_salary_percentage"]),
      target_input_id: z.string().nullable(),
      values: z.array(Scalar),
      default: Scalar,
      amount: z.number().nullable(),
      percentage: z.number().nullable(),
      payer: z.enum(["employer", "employee", "unallocated"]).nullable(),
    }),
    reason: z.string(),
    priority: z.number().int(),
    citations: z.array(Citation),
  })),
  warnings: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(["info", "warning", "error"]),
    citations: z.array(Citation),
  })),
});

const RequestSchema = z.object({
  documents: z.array(z.object({
    name: z.string().min(1).max(180),
    pages: z.array(z.string()).min(1).max(250),
  })).min(1).max(5),
});

const SYSTEM_PROMPT = `You turn benefit pricing documents into a deterministic, reviewable rate-table package.

Never invent a price, contribution split, restriction, option, formula, or citation. When source text is ambiguous, preserve the ambiguity in warnings. Return empty arrays rather than guessing.

Rules:
- Use stable snake_case IDs.
- Add exactly one boolean benefit_selection input named benefit_selected, required true, default false.
- Other inputs have purpose configuration. Use persona_field for facts already held on the employee profile, including persona.age, persona.employment_type, persona.tenure_months, persona.salary, persona.marital_status, persona.has_disability, persona.dependent_count, and persona.child_count.
- Rate rows contain exact numeric prices from the document. Split employer, employee, and unallocated costs only when the payer is explicit. Use unallocated when the payer is unstated.
- dimensions list every selector used by a table. Put equality dimensions in selectors and range/comparison dimensions in selector_conditions.
- For direct arithmetic rates, use calculation and leave rows empty.
- Conditions are declarative: all, any, not, eq, neq, in, not_in, gt, gte, lt, lte, between, exists.
- Effects are exclude, disable_option, restrict_values, require_input, set_default, add_flat_cost, or add_salary_percentage.
- Preserve exact boundary meaning: “over 70” is gt 70; “70 and over” is gte 70.
- Currency must be an ISO 4217 code. Billing period is month, year, or one_off.
- Every extracted rate, option, and rule should cite the exact source name, one-based page, and a short excerpt.
- Every schema field must be populated. Use null, an empty string, or an empty array where appropriate.

The supplied text was extracted locally from PDFs. Two spaces within a line may represent a table column boundary.`;

function documentPrompt(documents: z.infer<typeof RequestSchema>["documents"]) {
  return documents.map((document) =>
    document.pages.map((page, index) =>
      `=== SOURCE: ${document.name} · PAGE ${index + 1} ===\n${page}`,
    ).join("\n\n"),
  ).join("\n\n");
}

export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  if (request.method !== "POST") {
    response.status(405).json({ message: "Use POST to extract rate tables." });
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    response.status(503).json({ message: "PDF extraction is not configured on this deployment." });
    return;
  }

  try {
    const body = RequestSchema.parse(request.body);
    const sourceText = documentPrompt(body.documents);
    if (sourceText.length > 280_000) {
      response.status(413).json({ message: "These PDFs contain too much text for one extraction. Upload fewer or shorter documents." });
      return;
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const modelResponse = await client.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
      instructions: SYSTEM_PROMPT,
      input: sourceText,
      text: { format: zodTextFormat(PackageSchema, "rate_table_package") },
    });
    const parsed = modelResponse.output_parsed;
    if (!parsed) throw new Error("The model returned no structured rate table.");

    parsed.sources = body.documents.map((document, index) => ({
      id: `source-${index + 1}`,
      filename: document.name,
      page_count: document.pages.length,
      label: createHash("sha256").update(document.pages.join("\n")).digest("hex").slice(0, 12),
    }));
    const benefitInputs = parsed.inputs.filter((input) => input.purpose === "benefit_selection");
    parsed.inputs = parsed.inputs.filter((input) => input.purpose !== "benefit_selection");
    parsed.inputs.unshift(benefitInputs[0] ?? {
      id: "benefit_selected",
      label: "Select this benefit?",
      kind: "boolean" as const,
      purpose: "benefit_selection" as const,
      description: "Choose whether to include this benefit.",
      required: true,
      persona_field: null,
      options: [],
      minimum: null,
      maximum: null,
      step: null,
      default: false,
      citations: [],
    });
    parsed.inputs[0]!.id = "benefit_selected";
    parsed.inputs[0]!.required = true;
    parsed.inputs[0]!.default = false;

    response.setHeader("Cache-Control", "no-store");
    response.status(200).json(parsed);
  } catch (error) {
    console.error("Rate-table extraction failed", error);
    const message = error instanceof z.ZodError
      ? "The extraction request was invalid."
      : "The PDFs could not be converted into a rate table. Try a text-based PDF with clearer tables.";
    response.status(422).json({ message });
  }
}
