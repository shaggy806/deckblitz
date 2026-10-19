import { defineCard } from "../define.js";

// EDHREC rank 14372.
//
// Arachnogenesis's filtered fog: each source's power is asked as its combat damage would be
// dealt (rule 615.1), so a creature pumped past 3 power later in the turn isn't stopped.

export default defineCard({
  name: "Fog of War",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "You gain 1 life for each creature on the battlefield. Prevent all combat damage that would be dealt this turn by creatures with power 3 or less.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { countOf: { type: "creature" } } },
      { kind: "prevent-all-combat-damage", by: { type: "creature", power: { op: "lte", n: 3 } } },
    ],
  },
});
