import { defineCard } from "../define.js";

// X is paid in life (Toxic Deluge's `payLifeX`) and divided as it's cast,
// at least 1 to each target (rule 601.2d) — so no more targets than X. A
// target gone illegal loses its share (608.2b).
export default defineCard({
  name: "Fire Covenant",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text:
    "As an additional cost to cast this spell, pay X life.\n" +
    "Fire Covenant deals X damage divided as you choose among any number of target creatures.",
  additionalCost: { payLifeX: true },
  targets: [{ kind: "any-number", of: "creature" }],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
});
