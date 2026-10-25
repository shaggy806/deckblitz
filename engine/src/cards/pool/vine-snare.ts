import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 28055.
//
// Each creature's power is asked as its combat damage would be dealt, not as this resolves (the
// ruling; rule 615.1).

export default defineCard({
  name: "Vine Snare",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn by creatures with power 4 or less.",
  targets: [],
  effect: { kind: "prevent-all-combat-damage", by: { type: "creature", power: { op: "lte", n: 4 } } },
});
