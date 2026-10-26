import { defineCard } from "../define.js";

// Rulings: each other creature copies the target's copiable values only (rule 707.2), keeps its
// own counters and non-copy effects, and reverts as the turn ends.

export default defineCard({
  name: "Mirrorweave",
  manaCost: "{2}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Each other creature becomes a copy of target nonlegendary creature until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", notSupertype: "legendary" } }],
  effect: { kind: "become-copy", filter: { type: "creature" }, exceptOf: true, of: 0, until: "end-of-turn" },
});
