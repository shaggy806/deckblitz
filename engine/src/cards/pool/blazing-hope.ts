import { defineCard } from "../define.js";

// The power is compared with the caster's life total as the target is chosen
// and again as it resolves (the target filter is re-read then).
export default defineCard({
  name: "Blazing Hope",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature with power greater than or equal to your life total.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", power: { op: "gte", n: { amount: { lifeTotal: "you" } } } },
    },
  ],
  effect: { kind: "exile", target: 0 },
});
