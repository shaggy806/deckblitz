import { defineCard } from "../define.js";

// Ferocious is read once, as the spell resolves (the ruling): the opponents-only
// prevention then holds all turn, even if the big creature is gone by combat.
export default defineCard({
  name: "Winds of Qal Sisma",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn.\nFerocious — If you control a creature with power 4 or greater, instead prevent all combat damage that would be dealt this turn by creatures your opponents control.",
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
    then: { kind: "prevent-all-combat-damage", by: { type: "creature", controlledBy: "opponent" } },
    else: { kind: "prevent-all-combat-damage" },
  },
});
