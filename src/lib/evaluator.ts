import type {
  ConfigurationInput,
  EvaluatedInput,
  Evaluation,
  EvaluationCost,
  Persona,
  RateTablePackage,
  RateTableRule,
  RuleCondition,
  Scalar,
  Status,
} from "../types";

type Truth = "true" | "false" | "unknown";
const missing = Symbol("missing");

function personaValues(persona: Persona): Record<string, unknown> {
  const childCount = persona.household.filter((member) => member.relationship.toLowerCase() === "child").length;
  return {
    ...persona,
    dependent_count: persona.household.filter((member) => member.financially_dependent).length,
    child_count: childCount,
    ...persona.additional_attributes,
  };
}

function nestedValue(value: unknown, path: string): unknown | typeof missing {
  let current = value;
  for (const part of path.split(".")) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return missing;
    }
  }
  return current;
}

function resolveField(
  field: string,
  persona: Persona,
  selections: Record<string, Scalar>,
): unknown | typeof missing {
  if (field.startsWith("persona.")) return nestedValue(personaValues(persona), field.slice(8));
  if (field.startsWith("selections.")) return nestedValue(selections, field.slice(11));
  if (field in selections && selections[field] !== null) return selections[field];
  return nestedValue(personaValues(persona), field);
}

function equal(left: unknown, right: unknown): boolean {
  if (typeof left === "number" && typeof right === "number") return left === right;
  return left === right;
}

function compare(left: unknown, right: unknown, op: string): Truth {
  if (left === missing || left === null || right === null) return "unknown";
  const numeric = typeof left === "number" && typeof right === "number";
  const a = numeric ? left : String(left);
  const b = numeric ? right : String(right);
  let result = false;
  if (numeric) {
    if (op === "gt") result = (a as number) > (b as number);
    if (op === "gte") result = (a as number) >= (b as number);
    if (op === "lt") result = (a as number) < (b as number);
    if (op === "lte") result = (a as number) <= (b as number);
  } else {
    if (op === "gt") result = (a as string) > (b as string);
    if (op === "gte") result = (a as string) >= (b as string);
    if (op === "lt") result = (a as string) < (b as string);
    if (op === "lte") result = (a as string) <= (b as string);
  }
  return result ? "true" : "false";
}

function evaluateCondition(
  condition: RuleCondition,
  persona: Persona,
  selections: Record<string, Scalar>,
): Truth {
  if (condition.op === "all" || condition.op === "any") {
    const results = condition.conditions.map((child) => evaluateCondition(child, persona, selections));
    if (condition.op === "all") {
      if (results.includes("false")) return "false";
      return results.includes("unknown") ? "unknown" : "true";
    }
    if (results.includes("true")) return "true";
    return results.includes("unknown") ? "unknown" : "false";
  }
  if (condition.op === "not") {
    const result = condition.conditions[0]
      ? evaluateCondition(condition.conditions[0], persona, selections)
      : "unknown";
    return result === "unknown" ? result : result === "true" ? "false" : "true";
  }
  if (!condition.field) return "unknown";
  const actual = resolveField(condition.field, persona, selections);
  if (condition.op === "exists") return actual === missing || actual === null ? "false" : "true";
  if (actual === missing || actual === null) return "unknown";
  if (condition.op === "eq") return equal(actual, condition.value) ? "true" : "false";
  if (condition.op === "neq") return equal(actual, condition.value) ? "false" : "true";
  if (condition.op === "in" || condition.op === "not_in") {
    const included = condition.values.some((value) => equal(actual, value));
    return condition.op === "in" ? (included ? "true" : "false") : included ? "false" : "true";
  }
  if (condition.op === "between") {
    const lower = compare(actual, condition.values[0], "gte");
    const upper = compare(actual, condition.values[1], "lte");
    if (lower === "unknown" || upper === "unknown") return "unknown";
    return lower === "true" && upper === "true" ? "true" : "false";
  }
  return compare(actual, condition.value, condition.op);
}

function setState(current: Status, next: Status): Status {
  if (current === "disallowed" || next === "disallowed") return "disallowed";
  if (current === "needs_information" || next === "needs_information") return "needs_information";
  return "allowed";
}

function initialiseInput(
  input: ConfigurationInput,
  selections: Record<string, Scalar>,
  persona: Persona,
): EvaluatedInput {
  let value = selections[input.id] ?? input.default;
  if (value === null && input.persona_field) {
    const resolved = resolveField(input.persona_field, persona, selections);
    value = resolved === missing ? null : (resolved as Scalar);
  }
  return {
    input_id: input.id,
    state: "allowed",
    reasons: [],
    required: input.required,
    selected_value: value,
    suggested_default: input.default,
    options: input.options.map((option) => ({
      value: option.value,
      label: option.label,
      state: "allowed",
      reasons: [],
    })),
  };
}

function applyRule(rule: RateTableRule, truth: Truth, inputs: Map<string, EvaluatedInput>) {
  if (truth === "false") return;
  const targets = rule.effect.target_input_id
    ? [inputs.get(rule.effect.target_input_id)].filter(Boolean) as EvaluatedInput[]
    : [...inputs.values()];
  const unknownReason = `More information is needed to determine whether this rule applies: ${rule.reason}`;

  if (truth === "unknown") {
    if (!["exclude", "disable_option", "restrict_values", "require_input"].includes(rule.effect.type)) return;
    for (const input of targets) {
      input.state = setState(input.state, "needs_information");
      if (!input.reasons.includes(unknownReason)) input.reasons.push(unknownReason);
    }
    return;
  }

  if (rule.effect.type === "exclude") {
    for (const input of targets) {
      input.state = "disallowed";
      input.reasons.push(rule.reason);
      for (const option of input.options) {
        option.state = "disallowed";
        option.reasons.push(rule.reason);
      }
    }
  }
  if (rule.effect.type === "disable_option" || rule.effect.type === "restrict_values") {
    for (const input of targets) {
      for (const option of input.options) {
        const listed = rule.effect.values.some((value) => equal(option.value, value));
        const affected = rule.effect.type === "disable_option" ? listed : !listed;
        if (affected) {
          option.state = "disallowed";
          option.reasons.push(rule.reason);
        }
      }
    }
  }
  if (rule.effect.type === "require_input") {
    for (const input of targets) {
      if (input.selected_value === null) {
        input.state = setState(input.state, "needs_information");
        input.reasons.push(rule.reason);
      }
    }
  }
  if (rule.effect.type === "set_default") {
    for (const input of targets) input.suggested_default = rule.effect.default;
  }
}

function evaluateAvailability(
  ratePackage: RateTablePackage,
  persona: Persona,
  selections: Record<string, Scalar>,
  benefitSelected: boolean,
) {
  const inputs = new Map(
    ratePackage.inputs.map((input) => [input.id, initialiseInput(input, selections, persona)]),
  );
  if (benefitSelected) {
    for (const rule of [...ratePackage.rules].sort((a, b) => a.priority - b.priority)) {
      applyRule(rule, evaluateCondition(rule.condition, persona, selections), inputs);
    }
  }

  for (const definition of ratePackage.inputs) {
    const input = inputs.get(definition.id)!;
    const active = benefitSelected || definition.purpose === "benefit_selection";
    if (!active) continue;
    if (definition.required && input.selected_value === null && input.state !== "disallowed") {
      input.state = setState(input.state, "needs_information");
      input.reasons.push("Select an option to continue.");
    }
    if (definition.kind === "enum" && input.selected_value !== null) {
      const selected = input.options.find((option) => equal(option.value, input.selected_value));
      if (!selected) {
        input.state = "disallowed";
        input.reasons.push("The selected value is not a valid option.");
      } else if (selected.state !== "allowed") {
        input.state = setState(input.state, selected.state);
        input.reasons.push(...selected.reasons);
      }
    }
    if (definition.kind === "number" && input.selected_value !== null) {
      const value = Number(input.selected_value);
      if (!Number.isFinite(value)) {
        input.state = "disallowed";
        input.reasons.push("Enter a valid number.");
      } else if (definition.minimum !== null && value < definition.minimum) {
        input.state = "disallowed";
        input.reasons.push(`The value must be at least ${definition.minimum}.`);
      } else if (definition.maximum !== null && value > definition.maximum) {
        input.state = "disallowed";
        input.reasons.push(`The value must be no more than ${definition.maximum}.`);
      }
    }
  }
  return [...inputs.values()];
}

function addPayer(cost: EvaluationCost, payer: string, amount: number, sourceId: string, label: string) {
  if (payer === "employer") cost.employer_cost += amount;
  if (payer === "employee") cost.employee_cost += amount;
  if (payer === "unallocated") cost.unallocated_cost += amount;
  if (amount !== 0) cost.breakdown.push({ source_id: sourceId, label, amount });
}

function calculateCost(
  ratePackage: RateTablePackage,
  persona: Persona,
  selections: Record<string, Scalar>,
  benefitSelected: boolean,
  messages: Evaluation["messages"],
): EvaluationCost | null {
  const first = ratePackage.rate_tables[0];
  const cost: EvaluationCost = {
    currency: first?.currency ?? persona.salary_currency,
    billing_period: first?.billing_period ?? "month",
    employer_cost: 0,
    employee_cost: 0,
    unallocated_cost: 0,
    total_cost: 0,
    breakdown: [],
  };
  if (!benefitSelected) return cost;

  for (const table of ratePackage.rate_tables) {
    if (table.calculation) {
      const resolved = resolveField(table.calculation.input_id, persona, selections);
      const input = Number(resolved);
      if (resolved === missing || resolved === null || !Number.isFinite(input)) {
        messages.push({ code: "rate_dimensions_missing", message: `${table.name} needs a value for ${table.calculation.input_id}.`, state: "needs_information" });
        continue;
      }
      const amount = Number(((input * table.calculation.multiplier) / table.calculation.divisor).toFixed(table.calculation.rounding_places));
      addPayer(cost, table.calculation.payer, amount, table.id, table.name);
      continue;
    }

    const missingDimensions = table.dimensions.filter((dimension) => {
      const value = resolveField(dimension, persona, selections);
      return value === missing || value === null;
    });
    if (missingDimensions.length) {
      messages.push({ code: "rate_dimensions_missing", message: `${table.name} needs selections for ${missingDimensions.join(", ")}.`, state: "needs_information" });
      continue;
    }
    const matches = table.rows.filter((row) => {
      const selectorsMatch = Object.entries(row.selectors).every(([field, expected]) => equal(resolveField(field, persona, selections), expected));
      const conditionsMatch = row.selector_conditions.every((selector) =>
        evaluateCondition({ ...selector, conditions: [] }, persona, selections) === "true",
      );
      return selectorsMatch && conditionsMatch;
    });
    if (!matches.length) {
      messages.push({ code: "rate_not_found", message: `No matching rate was found in ${table.name}.`, state: "needs_information" });
      continue;
    }
    const match = matches.sort((a, b) => Object.keys(b.selectors).length + b.selector_conditions.length - Object.keys(a.selectors).length - a.selector_conditions.length)[0]!;
    addPayer(cost, "employer", match.employer_cost, `${table.id}:${match.id}`, match.label || table.name);
    addPayer(cost, "employee", match.employee_cost, `${table.id}:${match.id}`, match.label || table.name);
    addPayer(cost, "unallocated", match.unallocated_cost, `${table.id}:${match.id}`, match.label || table.name);
  }

  for (const rule of ratePackage.rules) {
    if (evaluateCondition(rule.condition, persona, selections) !== "true") continue;
    if (rule.effect.type === "add_flat_cost" && rule.effect.payer && rule.effect.amount !== null) {
      addPayer(cost, rule.effect.payer, rule.effect.amount, rule.id, rule.name);
    }
    if (rule.effect.type === "add_salary_percentage" && rule.effect.payer && rule.effect.percentage !== null) {
      const annual = persona.salary * rule.effect.percentage / 100;
      addPayer(cost, rule.effect.payer, cost.billing_period === "month" ? annual / 12 : annual, rule.id, rule.name);
    }
  }
  cost.total_cost = cost.employer_cost + cost.employee_cost + cost.unallocated_cost;
  return cost.breakdown.length ? cost : null;
}

export function evaluate(
  ratePackage: RateTablePackage,
  persona: Persona,
  selections: Record<string, Scalar>,
): Evaluation {
  const selectionInput = ratePackage.inputs.find((input) => input.purpose === "benefit_selection");
  const benefitSelected = selectionInput
    ? (selections[selectionInput.id] ?? selectionInput.default) === true
    : true;
  const inputs = evaluateAvailability(ratePackage, persona, selections, benefitSelected);
  const messages: Evaluation["messages"] = inputs.flatMap((input) =>
    input.reasons.map((message) => ({
      code: input.state === "disallowed" ? "input_unavailable" : "input_needs_information",
      message,
      state: input.state,
      input_id: input.input_id,
    })),
  );
  const cost = calculateCost(ratePackage, persona, selections, benefitSelected, messages);
  const states = [...inputs.map((input) => input.state), ...messages.map((message) => message.state)];
  const status: Status = states.includes("disallowed")
    ? "disallowed"
    : states.includes("needs_information")
      ? "needs_information"
      : "allowed";
  return { status, inputs, messages, cost };
}

export function initialSelections(ratePackage: RateTablePackage): Record<string, Scalar> {
  return Object.fromEntries(
    ratePackage.inputs.map((input) => [
      input.id,
      input.purpose === "benefit_selection" ? false : (input.default ?? input.options[0]?.value ?? null),
    ]),
  );
}
