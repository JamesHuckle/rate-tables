export type Scalar = string | number | boolean | null;
export type Status = "allowed" | "disallowed" | "needs_information";

export interface Citation {
  source_name: string;
  page_number: number;
  excerpt: string;
}

export interface RateTableSource {
  id: string;
  filename: string;
  page_count: number;
  label: string;
}

export interface InputOption {
  value: Scalar;
  label: string;
  description: string;
  citations: Citation[];
}

export interface ConfigurationInput {
  id: string;
  label: string;
  kind: "enum" | "boolean" | "number" | "date";
  purpose: "configuration" | "benefit_selection";
  description: string;
  required: boolean;
  persona_field: string | null;
  options: InputOption[];
  minimum: number | null;
  maximum: number | null;
  step: number | null;
  default: Scalar;
  citations: Citation[];
}

export interface SelectorCondition {
  field: string;
  op: "eq" | "neq" | "in" | "not_in" | "gt" | "gte" | "lt" | "lte" | "between";
  value: Scalar;
  values: Scalar[];
}

export interface RateRow {
  id: string;
  label: string;
  selectors: Record<string, Scalar>;
  selector_conditions: SelectorCondition[];
  employer_cost: number;
  employee_cost: number;
  unallocated_cost: number;
  citations: Citation[];
}

export interface RateCalculation {
  input_id: string;
  multiplier: number;
  divisor: number;
  payer: "employer" | "employee" | "unallocated";
  rounding_places: number;
  citations: Citation[];
}

export interface RateTable {
  id: string;
  name: string;
  description: string;
  currency: string;
  billing_period: "month" | "year" | "one_off";
  dimensions: string[];
  rows: RateRow[];
  calculation: RateCalculation | null;
  citations: Citation[];
}

export interface RuleCondition {
  op: string;
  field: string | null;
  value: Scalar;
  values: Scalar[];
  conditions: RuleCondition[];
}

export interface RuleEffect {
  type: "exclude" | "disable_option" | "restrict_values" | "require_input" | "set_default" | "add_flat_cost" | "add_salary_percentage";
  target_input_id: string | null;
  values: Scalar[];
  default: Scalar;
  amount: number | null;
  percentage: number | null;
  payer: "employer" | "employee" | "unallocated" | null;
}

export interface RateTableRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  effect: RuleEffect;
  reason: string;
  priority: number;
  citations: Citation[];
}

export interface ExtractionWarning {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  citations: Citation[];
}

export interface RateTablePackage {
  schema_version: string;
  title: string;
  sources: RateTableSource[];
  inputs: ConfigurationInput[];
  rate_tables: RateTable[];
  rules: RateTableRule[];
  warnings: ExtractionWarning[];
}

export interface HouseholdMember {
  relationship: string;
  age?: number;
  financially_dependent: boolean;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  age: number;
  employment_type: string;
  employee_class: string;
  job_title: string;
  salary: number;
  salary_currency: string;
  tenure_months: number;
  weekly_hours: number;
  country: string;
  marital_status: string;
  has_disability: boolean;
  is_sole_earner: boolean;
  company_founder: boolean;
  household: HouseholdMember[];
  additional_attributes: Record<string, unknown>;
}

export interface EvaluatedOption {
  value: Scalar;
  label: string;
  state: Status;
  reasons: string[];
}

export interface EvaluatedInput {
  input_id: string;
  state: Status;
  reasons: string[];
  required: boolean;
  selected_value: Scalar;
  suggested_default: Scalar;
  options: EvaluatedOption[];
}

export interface EvaluationCost {
  currency: string;
  billing_period: string;
  employer_cost: number;
  employee_cost: number;
  unallocated_cost: number;
  total_cost: number;
  breakdown: Array<{ source_id: string; label: string; amount: number }>;
}

export interface Evaluation {
  status: Status;
  inputs: EvaluatedInput[];
  messages: Array<{ code: string; message: string; state: Status; input_id?: string }>;
  cost: EvaluationCost | null;
}

export interface ExtractedDocument {
  name: string;
  pages: string[];
}
