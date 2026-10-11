import { defineCard } from "../define.js";

/**
 * The Jace planeswalker token Empower Jace makes (rule 701.71a — the
 * `empower-jace` effect): blue, 0 loyalty, "[−1]: Surveil 1" and "[−3]: Draw a
 * card." Not legendary — a token's type line is only what the rule gives it.
 * It enters with no loyalty and gets its counters in the same resolution.
 */
export default defineCard({
  name: "Jace Token",
  art: "8d1e424f-6407-4f8c-bed2-eaf148237c81",
  colors: ["U"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 0,
  text: "−1: Surveil 1.\n−3: Draw a card.",
  activated: [
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "−1: Surveil 1.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "−3: Draw a card.",
    },
  ],
});
