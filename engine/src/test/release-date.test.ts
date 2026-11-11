import { describe, expect, it } from "vitest";

import { FIRST_PRINTED, releaseDateOf } from "../cards/release-date.js";

// The generated first-printing table behind the library's "Release date"
// sort (`npm run gen:release-dates -w engine`).

describe("releaseDateOf", () => {
  it("gives the day a card was first printed, not a reprint's", () => {
    expect(releaseDateOf("Lightning Bolt")).toBe("1993-08-05");
    expect(releaseDateOf("Command Tower")).toBe("2011-06-17");
  });

  it("knows a split card by its whole name and a double-faced card by its front", () => {
    expect(releaseDateOf("Fire // Ice")).toBe("2001-06-04");
    expect(releaseDateOf("Delver of Secrets")).toBe("2011-09-30");
  });

  it("answers null for a name it doesn't list", () => {
    expect(releaseDateOf("No Such Card")).toBeNull();
  });

  it("lists each name under one date, every date YYYY-MM-DD", () => {
    const seen = new Set<string>();
    for (const [date, names] of Object.entries(FIRST_PRINTED)) {
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const name of names) {
        expect(seen.has(name)).toBe(false);
        seen.add(name);
      }
    }
  });
});
