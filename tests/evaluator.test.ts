import { describe, expect, it } from "vitest";

import { examplePackage, personas } from "../src/data/example";
import { evaluate, initialSelections } from "../src/lib/evaluator";

describe("rate table evaluator", () => {
  it("returns zero when a benefit is declined", () => {
    const result = evaluate(examplePackage, personas[0]!, initialSelections(examplePackage));
    expect(result.status).toBe("allowed");
    expect(result.cost?.total_cost).toBe(0);
  });

  it("matches a persona age band and cover level", () => {
    const result = evaluate(examplePackage, personas[0]!, {
      benefit_selected: true,
      cover_level: "employee",
      excess: 100,
    });
    expect(result.status).toBe("allowed");
    expect(result.cost?.employer_cost).toBe(24);
    expect(result.cost?.employee_cost).toBe(18);
    expect(result.cost?.total_cost).toBe(42);
  });

  it("disables a rule-restricted option but keeps an indicative price", () => {
    const result = evaluate(examplePackage, personas[2]!, {
      benefit_selected: true,
      cover_level: "family",
      excess: 100,
    });
    expect(result.status).toBe("disallowed");
    expect(result.inputs.find((input) => input.input_id === "cover_level")?.state).toBe("disallowed");
    expect(result.cost?.total_cost).toBe(235);
  });

  it("applies a flat-cost discount", () => {
    const result = evaluate(examplePackage, personas[0]!, {
      benefit_selected: true,
      cover_level: "employee",
      excess: 250,
    });
    expect(result.cost?.employee_cost).toBe(14);
    expect(result.cost?.total_cost).toBe(38);
  });
});
